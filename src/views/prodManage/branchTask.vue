<template>
  <single-page class="table-page branch-task">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :data="tableData"
        :loading="loading"
        :columns="tableColumns"
        :column-type="['selection', 'index']"
        @selection-change="selectionChange"
        :total="pageTotal"
        height="100%"
        @update-data="getTableData"
      >
        <div slot="btn">
          <el-button type="primary" @click="printTag">打印标签</el-button>
          <el-button type="primary" @click="removeOrder">移除订单</el-button>
        </div>
      </dj-table>
    </page-pane>
    <dj-dialog v-if="visible" ref="dialog" @close="close" @confirm="confirm" title="处理" v-loading="dialogLoading">
      <classify-form ref="multiForm" :config="multiFormOptions" :column-num="2" :form-data="formData"></classify-form>
    </dj-dialog>
    <order-tag ref="printTag" :data="checkedList"></order-tag>
  </single-page>
</template>

<script>
  import dayjs from 'dayjs';
  import branchTaskService from '../../api/service/branchTask';
  import {djForm} from 'djweb';
  import formRules from "../baseSetting/formRules";
  import orderTag from '../../components/printTag/orderTag';
  import materialSizeInput from "../../components/materialSizeInput";
  const branchStatusOptions = [
    {label: '待处理', value: '0'},
    {label: '处理中', value: '1'},
    {label: '已处理', value: '2'},
    {label: '全部', value: ''},
  ];
  const initFormData = {
    mergeOrderNumber: '',
    produceOrderNumber: '',
    waitHandleNum: '',
    handledNum: '',
  };
  export default {
    name: 'branchTask',
    data() {
      const handleNum = (rule, value, callback) => {
        if (Number(value) === 0) {
          callback(new Error('处理数量不能为0'));
        }
        if (Number(value) > Number(this.formData.waitHandleNum)) {
          callback(new Error('处理数量不能大于待处理数量'));
        } else {
          callback();
        }
      };
      return {
        searchConfig: [
          {
            label: '生成时间', key: 'timeRange', type: 'date', attrs: {
              type: 'daterange',
              clearable: false,
              default: [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
              beforeChange: (val) => {
                let _val = val ? [...val] : [];
                if (val[0] && val[1]) {
                  let towMonth = dayjs(val[0]).add(92, 'day');
                  if (towMonth.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], dayjs(towMonth).toDate()];
                  }
                  _val[0] = dayjs(_val[0]).format('YYYY-MM-DD 00:00:00');
                  _val[1] = dayjs(_val[1]).format('YYYY-MM-DD 23:59:59');
                }
                return _val;
              }
            }
          },
          {label: '分线状态', key: 'divideState', type: 'select', attrs: {options: branchStatusOptions, default: ''}},
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '订单编号', key: 'produceOrderNumber', type: 'input'},
          {
            label: '下料规格', key: 'guige', type: 'custom', attrs: {
              default: [null, null],
              reg: this.$reg.getFloatReg(1)
            },
            component: materialSizeInput
          },
        ],
        tableData: [],
        tableColumns: [
          {
            label: '操作', prop: 'operation', fixed: 'right', width: '70',
            render: (h, {props: {row}}) => {
              return (
                <a class={row.divideState === '已处理' ? 'divideState-completed' : ''}
                   onClick={() => this.handle(row)}>处理</a>
              );
            },
          },
          {
            label: '订单标记', prop: 'grouponOrderFlag', render: (h, {props: {row}}) => {
              const markMap = ['', 'urgent', 'delay'];
              const markTextMap = ['', '急', '延'];
              return (
                <div class={markMap[row.grouponOrderFlag]}>{markTextMap[row.grouponOrderFlag]}</div>
              );
            }
          },
          {label: '分线状态', prop: 'divideState', formatter: row=>{
            const textMap = ['待处理', '处理中', '已处理'];
            return textMap[row.divideState];
            }},
          {label: '合并编号', prop: 'combineId', width: 160},
          {label: '订单编号', prop: 'grouponOrderNumber', width: 240},
          {label: '生产编号', prop: 'produceOrderNumber', width: 180},
          {label: '用料代码', prop: 'materialCode'},
          {label: '瓦楞楞型', prop: 'tileModel'},
          {label: '订单数量', prop: 'pieceAmount'},
          {label: '处理数量', prop: 'processeAmount'},
          {label: '下料规格(cm)', prop: 'xialiaoguige', width: 150,
            formatter: row=>row.materialLength + '*' + row.materialWidth},
          {label: '产品规格', prop: 'prodGuige', width: 160, formatter: row=>{
              return row.productLength + '*' + row.productWidth + '*' + row.productHeight;
            }},
          {label: '压线方式', prop: 'staveType'},
          {label: '纵压公式', prop: 'vformula', width: 180},
          {label: '横压公式', prop: 'hformula', width: 180},
          {label: '订单交期', prop: 'arriveTime', width: 180},
          {label: '客户名称', prop: 'customerName', width: 180},
          {label: '产品名称', prop: 'grouponProductName', width: 160},
          {label: '生成时间', prop: 'createTime', width: 180},
          {label: '处理人', prop: 'operator', width: 180},
          {label: '处理时间', prop: 'updateTime', width: 180},
        ],
        pageTotal: 0,
        searchData: {},
        loading: false,
        dialogLoading: false,
        checkedList: [],

        formData: initFormData,
        multiFormOptions: [
          {
            formOptions: [
              {
                type: 'input',
                formItem: {
                  prop: 'combineId',
                  label: '合并编号',
                },
                attrs: {
                  disabled: true,
                },
              },
              {
                type: 'input',
                formItem: {
                  prop: 'produceOrderNumber',
                  label: '生产编号',
                },
                attrs: {
                  disabled: true,
                },
              },
              {
                type: 'input',
                formItem: {
                  prop: 'waitHandleNum',
                  label: '待处理数量',
                },
                attrs: {
                  disabled: true,
                },
              },
              {
                type: 'input',
                formItem: {
                  prop: 'processeAmount',
                  label: '处理数量',
                  rules: [
                    djForm.rules.required('请输入处理数量'),
                    formRules.number,
                    {validator: handleNum}
                  ],
                },
                attrs: {
                  maxlength: 10,
                },
              },
            ],
            columnNum: '2'
          },
          {
            title: '订单信息',
            formOptions: [
              {formItem: {prop: 'grouponOrderNumber', label: '订单编号：'}},
              {formItem: {prop: 'pieceAmount', label: '订单数量：'}},
              {formItem: {prop: 'arriveTime', label: '订单交期：'}},
              {formItem: {prop: 'grouponProductName', label: '产品名称：'}},
              {formItem: {prop: 'customerName', label: '客户名称：'}},
              {formItem: {prop: 'prodGuige', label: '产品规格：'}},
              {formItem: {prop: 'materialCode', label: '用料代码：'}},
              {formItem: {prop: 'tileModel', label: '瓦楞楞型：'}},
              {formItem: {prop: 'xialiaoguige', label: '下料规格：'}},
              {formItem: {prop: 'staveType', label: '压线方式：'}},
              {formItem: {prop: 'hformula', label: '横压公式：'}},
              {formItem: {prop: 'vformula', label: '纵压公式：'}},
            ],
            columnNum: '2'
          }
        ],
        visible: false,
      };
    },
    methods: {
      handle(row) {
        this.getDivideMsg(row.id);
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.dialog.open();
        });
      },
      close() {
        this.visible = false;
        this.formData = initFormData;
      },
      confirm() {
        this.$refs.multiForm.$refs.form[0].validate((valid) => {
          if (valid) {
            this.dialogLoading = true;
            let {id, processeAmount, divideState } = this.formData;
            processeAmount = processeAmount.replace(/^[0]*/g, '');
            this.dj_api_extend(branchTaskService.processe, {
              id: id,
              processeAmount: processeAmount,
              divideState: divideState,
            }).then(res => {
              this.$message('处理成功', 'success');
              this.close();
              this.$refs.search.search();
            }).finally(() => {
              this.dialogLoading = false;
            });
          }
        });
      },
      printTag() {
        const {length} = this.checkedList;
        if (length === 0) {
          this.$message('请选择订单', 'error');
          return false;
        }
        this.$refs.printTag.print();
      },
      removeOrder() {
        const { length } = this.checkedList
        if (length === 0) {
          const h = this.$createElement;
          this.$msgbox({
            title: '',
            customClass: 'branch-task',
            type: 'warning',
            showClose: false,
            message: h('div', {class: 'branch-task-msg'}, [
              h('p', {class: 'msg-header'}, `确定移除${length}条订单？`),
              h('div', {class: 'msg-content'}, [
                h('p', {class: 'msg-content-label'}, `合并编号：`),
                h('div', {class: 'msg-content-detail'}, [
                  h('span', {class: 'msg-content-item'}, `V2019091601`),
                  h('span', {class: 'msg-content-item'}, `V2019091601`),
                  h('span', {class: 'msg-content-item'}, `V2019091601`),
                  h('span', {class: 'msg-content-item'}, `V2019091601`),
                  h('span', {class: 'msg-content-item'}, `V2019091601`),
                  h('span', {class: 'msg-content-item'}, `V2019091601`),
                ]),
              ]),
            ])});
          this.$message('请选择订单', 'error');
          return false;
        } else {
          // todo 确认移除所选X条订单？ 合并编号：V20190611001、V20190611002
          this.$confirm('确定移除所选订单？', '', { //todo
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.loading = true;
            const idList = this.checkedList.map(v=>{
              return {
                id: v.id
              };
            });
            this.dj_api_extend(branchTaskService.removeOrder, idList).then(res => {
              this.$message('移除成功', 'success');
            }).catch(() => {
              this.loading = false;
            }).finally(() => {
              this.$refs.search.search();
            });
          });

        }
      },
      selectionChange(checkedList) {
        this.checkedList = checkedList;
      },
      search(query) {
        let {timeRange, guige, ...restQuery} = query;
        let params = {
          ...restQuery,
          startTime: timeRange[0],
          endTime: timeRange[1],
        };
        guige = guige.map(v=>{
          if (v) {
            return v.replace(/\.$/g, '');
          }
          return null;
        });
        let guigeparams = {
          materialLength: guige[0],
          materialWidth: guige[1],
        };
        Object.assign(params, guigeparams);
        this.searchData = params;
        this.$refs.table.changePage(1);
      },
      getTableData(data) {
        this.loading = true;
        this.dj_api_extend(branchTaskService.list, {
          ...data,
          ...this.searchData
        }).then(res => {
          const {list, total} = res;
          this.tableData = list;
          this.pageTotal = total;
        }).finally(() => {
          this.loading = false;
        });
      },
      getDivideMsg (id) {
        this.dj_api_extend(branchTaskService.getDivideMsg, {
          id: id
        }).then(res => {
          res.xialiaoguige = res.materialLength + '*' + res.materialWidth;
          res.prodGuige = res.productLength + '*' + res.productWidth + '*' + res.productHeight;
          res.waitHandleNum = res.pieceAmount - res.processeAmount;
          this.formData = res;
          this.formData.processeAmount = '';
        });
      },
    },
    mounted() {
      this.$refs.search.search();
    },
    components: {orderTag}
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .xialiaoguige {
    display: flex;
    .text {
      margin: auto 5px;
    }
  }

  @{deep} .operation {
    line-height: 1;
    a {
      color: #3654EA;
      padding: 2px 10px;
      cursor: pointer;
    }
    .divideState-completed {
      pointer-events: none;
      color: #909399;
    }
  }

  @{deep} .cell {
    .urgent {
      color: #ff0000;
    }
    .delay {
      color: #F89816;
    }
  }

  .dialog {
    width: 1100px;
    .order-info-text {
      font-family: PingFang SC Medium, sans-serif;
      font-weight: 500;
      color: rgba(48, 49, 51, 1);
      width: 105px;
      padding: 15px 8px 15px 0;
      text-align: right;
    }
  }
  .branch-task-msg{}
  .msg-header{
    font-size:16px;
    font-weight:500;
    color:rgba(48,49,51,1);
    line-height:22px;
    margin-bottom: 20px;
  }
  .msg-content{
    line-height:22px;
    color:rgba(96,98,102,1);
    font-size:14px;
    font-weight:400;
    &-label{
      width: 80px;
      margin-bottom: 16px;
    }
    &-detail{
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    &-item{
      margin-right: 16px;
      margin-bottom: 8px;
    }
  }
</style>
<style lang="less">
  .branch-task{
    width: 442px;
    &.el-message-box{
      .el-message-box__content{
        .el-message-box__status{
          top: 20px;
        }
      }
    }
  }
</style>
