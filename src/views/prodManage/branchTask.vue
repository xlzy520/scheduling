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
    <order-tag ref="printTag" :data="checkedList" :ext-order-keys="extOrderKeys"></order-tag>
  </single-page>
</template>

<script>
  import dayjs from 'dayjs';
  import branchTaskService from '../../api/service/branchTask';
  import orderTag from '../../components/printTag/orderTag';
  import materialSizeInput from "../../components/materialSizeInput";
  import {orderKeys} from "../../utils/system/constant/dataKeys";
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
              default: this.$method.getDateRange('daterange', 1),
              // default: [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
              beforeChange: this.$method.getLimitTime
            }
          },
          {label: '分线状态', key: orderKeys.branchStatus, type: 'select', attrs: {options: this.$enum.branchStatus._arr, default: ''}},
          {label: '用料代码', key: orderKeys.materialCode, type: 'input'},
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
            label: '操作', prop: 'operation', fixed: 'right', width: '84',
            render: (h, {props: {row}}) => {
              let disabled = this.$enum.branchStatus.isInclude(row[orderKeys.branchStatus], 'already');
              return (
                <div class="td-btn-group">
                  <a class={disabled ? 'disabled' : ''}
                     onClick={() => !disabled && this.handle(row)}>处理</a>
                </div>
              );
            },
          },
          {
            label: '订单标记', prop: orderKeys.orderTip, width: 80,
            render: (h, {props: {cur}}) => {
              let obj = this.$enum.orderTip.getMsg(cur);
              let text = obj.omit || '';
              let key = obj.value || '';
              return (
                <span class={text ? [key, 'tip-txt'] : ''}>{text}</span>
              );
            }
          },
          {
            label: '分线状态', prop: orderKeys.branchStatus, width: 80, formatter: (row, index, cur) => {
              return this.$enum.branchStatus.getLabel(cur);
            }
          },
          {label: '合并编号', prop: orderKeys.combineId, width: 160},
          {label: '订单编号', prop: orderKeys.orderId, width: 220},
          {label: '生产编号', prop: orderKeys.productionNo, width: 160},
          {label: '用料代码', prop: orderKeys.materialCode, width: 80},
          {label: '瓦楞楞型', prop: 'fluteTypeAndLayers', width: 80},
          {label: '订单数量', prop: orderKeys.orderAmount, width: 80},
          {label: '处理数量', prop: 'processeAmount', width: 80},
          {
            label: '下料规格(cm)', prop: orderKeys.materialSize, width: 120,
          },
          {
            label: '产品规格', prop: orderKeys.productSize, width: 110
          },
          {label: '压线方式', prop: orderKeys.linePressingMethod, width: 80},
          {label: '纵压公式', prop: orderKeys.longitudinalPressure, width: 200},
          {label: '横压公式', prop: orderKeys.transversePressure, width: 160},
          {label: '订单交期', prop: orderKeys.deliveryTime, width: 110},
          {label: '客户名称', prop: orderKeys.customerName, width: 120},
          {label: '产品名称', prop: orderKeys.productName, width: 100},
          {label: '生成时间', prop: 'createTime', width: 180},
          {label: '处理人', prop: orderKeys.operator, width: 85},
          {label: '处理时间', prop: 'updateTime', width: 180},
        ],
        pageTotal: 0,
        searchData: {},
        loading: false,
        dialogLoading: false,
        checkedList: [],

        formData: {},
        multiFormOptions: [
          {
            formOptions: [
              {
                type: 'input',
                formItem: {
                  prop: orderKeys.combineId,
                  label: '合并编号',
                },
                attrs: {
                  disabled: true,
                },
              },
              {
                type: 'input',
                formItem: {
                  prop: orderKeys.productionNo,
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
                    this.$rule.required('请输入处理数量'),
                    this.$rule.number,
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
              {formItem: {prop: orderKeys.orderId, label: '订单编号'}},
              {formItem: {prop: orderKeys.orderAmount, label: '订单数量'}},
              {formItem: {prop: orderKeys.deliveryTime, label: '订单交期'}},
              {formItem: {prop: orderKeys.productName, label: '产品名称'}},
              {formItem: {prop: orderKeys.customerName, label: '客户名称'}},
              {formItem: {prop: orderKeys.productSize, label: '产品规格'}},
              {formItem: {prop: orderKeys.materialCode, label: '用料代码'}},
              {formItem: {prop: 'fluteTypeAndLayers', label: '瓦楞楞型'}},
              {formItem: {prop: orderKeys.materialSize, label: '下料规格'}},
              {formItem: {prop: orderKeys.linePressingMethod, label: '压线方式'}},
              {formItem: {prop: orderKeys.transversePressure, label: '横压公式'}},
              {formItem: {prop: orderKeys.longitudinalPressure, label: '纵压公式'}},
            ],
            columnNum: '2'
          }
        ],
        visible: false,
        extOrderKeys: {
          packageAmount: 'packNumber',
          consignee: 'reciver',
        },
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
        this.formData = {};
      },
      confirm() {
        this.$refs.multiForm.$refs.form[0].validate((valid) => {
          if (valid) {
            this.dialogLoading = true;
            let post = this.$method.cloneData(['id', 'processeAmount', orderKeys.branchStatus], {}, this.formData);
            // let {id, processeAmount, divideState} = this.formData;
            post.processeAmount = Number(post.processeAmount);
            this.dj_api_extend(branchTaskService.processe, post).then(() => {
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
        const {length} = this.checkedList;
        if (length === 0) {
          this.$message('请选择订单', 'error');
          return false;
        } else {
          const h = this.$createElement;
          //如果不存在合并编号数据
          let message = '';
          if (this.checkedList.every(v => !v.combineId)) {
            message = h('p', null, `确定移除${length}条订单？`);
          } else {
            const msgContentItem = (content = '') => h('span', {class: 'msg-content-item'}, content);
            let content = [];
            this.checkedList.filter(v => v.combineId).map((v, index) => {
              if (index < 8) {
                content.push(msgContentItem(v.combineId));
              } else if (index === 8) {
                content.push(msgContentItem('...'));
              }
              return false;
            });
            message = h('div', {class: 'branch-task-msg'}, [
              h('p', {class: 'msg-header'}, `确定移除${length}条订单？`),
              h('div', {class: 'msg-content'}, [
                h('p', {class: 'msg-content-label'}, `合并编号：`),
                h('div', {class: 'msg-content-detail'}, content),
              ]),
            ]);
          }

          this.$msgbox({
            title: '',
            customClass: 'branch-task',
            type: 'warning',
            showClose: false,
            showCancelButton: true,
            message: message
          }).then(() => {
            this.loading = true;
            const idList = this.checkedList.map(v => {
              return {
                id: v.id
              };
            });
            this.dj_api_extend(branchTaskService.removeOrder, idList).then(() => {
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
        guige = guige.map(v => {
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
          const {list = [], total} = res;
          list.map(obj=>{
            obj['associatedOrders'] = obj['grouponOrderNumber'];
          });
          this.tableData = list;
          this.pageTotal = total;
        }).finally(() => {
          this.loading = false;
        });
      },
      getDivideMsg(id) {
        this.dj_api_extend(branchTaskService.getDivideMsg, {
          id: id
        }).then(res => {
          // res.xialiaoguige = res.materialLength + '*' + res.materialWidth;
          // res.prodGuige = res.productLength + '*' + res.productWidth + '*' + res.productHeight;
          res.waitHandleNum = res[orderKeys.orderAmount] - res.processeAmount;
          res.processeAmount = '';
          this.formData = res;
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

  .dialog {
    width: 1100px;

    .order-info-text {
      width: 105px;
      padding: 15px 8px 15px 0;
      font-family: PingFang SC Medium, sans-serif;
      font-weight: 500;
      color: rgba(48, 49, 51, 1);
      text-align: right;
    }
  }

  .msg-header {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    color: rgba(48, 49, 51, 1);
  }

  .msg-content {
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: rgba(96, 98, 102, 1);

    &-label {
      width: 80px;
      margin-bottom: 16px;
    }

    &-detail {
      display: flex;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    &-item {
      margin-right: 16px;
      margin-bottom: 8px;
    }
  }
</style>
<style lang="less">
  .branch-task {
    width: 442px;

    &.el-message-box {
      .el-message-box__content {
        .el-message-box__status {
          top: 20px;
        }
      }
    }
  }
</style>
