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
      <div class="dialog">
        <dj-form :form-data="formData" ref="form" :form-options="formOptions" :column-num="2"></dj-form>
        <div class="order-info-text">订单信息</div>
        <dj-form :form-data="formData" :form-options="orderFormOptions" :column-num="3"></dj-form>
      </div>
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
  const branchStatusOptions = [
    {label: '待处理', value: '0'},
    {label: '处理中', value: '1'},
    {label: '已处理', value: '2'},
    {label: '全部', value: ''},
  ];
  const initFormData = {
    mergeOrderNumber: '',
    produceOrderNumber: '',
    waitHandleNum: 222,
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
              default: [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
              beforeChange: (val) => {
                let _val = val;
                if (val[0] && val[1]) {
                  let day92 = dayjs(val[0]).add(92, 'day');
                  if (day92.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], day92.toDate()];
                  }
                }
                _val[0] += ' 00:00:00';
                _val[1] += ' 23:59:59';
                return _val;
              },
              type: 'daterange',
              pickerOptions: {
                shortcuts: [
                  {
                    text: '今天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      picker.$emit('pick', [start, end]);
                    }
                  },
                  {
                    text: '近7天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                      picker.$emit('pick', [start, end]);
                    }
                  },
                  {
                    text: '近30天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                      picker.$emit('pick', [start, end]);
                    }
                  }
                ]
              },
              valueFormat: "yyyy-MM-dd"
            }
          },
          {label: '分线状态', key: 'divideState', type: 'select', attrs: {options: branchStatusOptions}},
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '订单编号', key: 'produceOrderNumber', type: 'input', attrs: {reg: /\w+/g}},
          {
            label: '下料规格', key: 'guige', type: 'custom',
            component: {
              data() {
                return {
                  start: '',
                  end: ''
                };
              },
              props: {
                value: {
                  type: Array,
                  default: () => [null, null]
                },
              },
              methods: {
                update(val) {
                  this.start = val[0];
                  this.end = val[1];
                }
              },
              render(h) {
                const input = (index, val) => {
                  const value = this.value;
                  value[index] = val;
                  this.update(value);
                  this.$emit('input', value);
                };
                return (
                  <div class="xialiaoguige">
                    <dj-input type='number' value={this.start} onInput={val => input(0, val)}
                              placeholder="切长cm" maxlength="10"/>
                    <span class="text">*</span>
                    <dj-input type='number' value={this.end} onInput={val => input(1, val)}
                              placeholder="切宽cm" maxlength="10"/>
                  </div>
                );
              }
            }
          },
        ],
        tableData: [],
        tableColumns: [
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
          {label: '合并编号', prop: 'combineId', width: 120},
          {label: '订单编号', prop: 'grouponOrderNumber', width: 210},
          {label: '生产编号', prop: 'produceOrderNumber', width: 120},
          {label: '用料代码', prop: 'materialCode'},
          {label: '瓦楞楞型', prop: 'tileModel'},
          {label: '订单数量', prop: 'pieceAmount'},
          {label: '生产数量', prop: 'produceAmount'},
          {label: '处理数量', prop: 'processeAmount'},
          {label: '下料规格(cm)', prop: 'xialiaoguige', width: 120,
            formatter: row=>row.materialLength + '*' + row.materialWidth},
          {label: '产品规格', prop: 'prodGuige', width: 210, formatter: row=>{
              return row.productLength + '*' + row.productWidth + '*' + row.productHeight;
            }},
          {label: '压线方式', prop: 'staveType'},
          {label: '纵压公式', prop: 'vformula', width: 120},
          {label: '横压公式', prop: 'hformula', width: 160},
          {label: '订单交期', prop: 'arriveTime', width: 180},
          {label: '客户名称', prop: 'customerName', width: 160},
          {label: '产品名称', prop: 'grouponProductName', width: 160},
          {label: '生成时间', prop: 'createTime', width: 180},
          {label: '操作人', prop: 'operator', width: 120},
          {label: '操作时间', prop: 'updateTime', width: 180},
          {
            label: '操作', prop: 'operation', fixed: 'right',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a class={row.divideState === '已处理' ? 'divideState-completed' : ''}
                     onClick={() => this.handle(row)}>处理</a>
                </div>
              );
            },
          },
        ],
        pageTotal: 0,
        searchData: {},
        loading: false,
        dialogLoading: false,
        checkedList: [],

        formData: initFormData,
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
        orderFormOptions: [
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
        visible: false,
      };
    },
    methods: {
      handle(row) {
        this.formData = this.$method.deepClone(row);
        this.formData.processeAmount = '';
        this.formData.xialiaoguige = row.materialLength + '*' + row.materialWidth;
        this.formData.prodGuige = row.productLength + '*' + row.productWidth + '*' + row.productHeight;
        this.formData.waitHandleNum = row.pieceAmount - row.processeAmount;
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
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.dialogLoading = true;
            const {id, processeAmount, divideState } = this.formData;
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
          this.$message('订单未选择，请重新操作', 'error');
          return false;
        }
        this.$refs.printTag.print();
      },
      removeOrder() {
        if (this.checkedList.length === 0) {
          this.$message('订单未选择，请重新操作', 'info');
          return false;
        } else {
          this.$confirm('确定移除该条内容吗？', '', { //todo
            type: 'warning',
            showClose: false,
          }).then(() => {
            const canRemove = this.checkedList.some(v => !['已处理', '处理中'].includes(v.divideState));
            if (canRemove) {
              this.loading = true;
              const idList = this.checkedList.map(v=>{
                return {
                  id: v.id
                };
              });
              this.dj_api_extend(branchTaskService.removeOrder, idList).then(res => {
                this.$message('移除成功', 'success');
                this.$refs.search.search();
              }).catch(() => {
                this.loading = false;
              });
            } else {
              this.$message(' 分线状态发生变化，无法进行操作', 'warning');
            }
          });

        }
      },
      selectionChange(checkedList) {
        this.checkedList = checkedList;
      },
      search(query) {
        const {timeRange, guige, ...restQuery} = query;
        let params = {
          ...restQuery,
          startTime: timeRange[0],
          endTime: timeRange[1],
        };
        if (guige !== undefined) {
          let guigeparams = {
            materialLength: guige[0],
            materialWidth: guige[1],
          };
          Object.assign(params, guigeparams);
        }
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
      }
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

</style>
