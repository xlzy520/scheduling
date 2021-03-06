<template>
  <single-page class="table-page branch-task">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
          ref="table"
          :data="tableData"
          :loading="loading"
          :columns="tableColumns"
          is-cache-columns
          :cache-columns-name="$store.getters.uids+'-'+ $route.name"
          :column-type="['selection', 'index']"
          row-select
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
    <look-dialog v-if="visible" ref="dialog" @close="close" @confirm="confirm"></look-dialog>
    <order-tag ref="printTag" :data="checkedList" :ext-order-keys="extOrderKeys"></order-tag>
  </single-page>
</template>

<script>
  import branchTaskService from '../../api/service/branchTask';
  import orderTag from '../../components/printTag/orderTag';
  import materialSizeInput from "../../components/materialSizeInput";
  import lookDialog from "./branchTaskModule/lookDialog";

  const branchStatusOptions = [
    {label: '待处理', value: '0'},
    {label: '处理中', value: '1'},
    {label: '已处理', value: '2'},
    {label: '全部', value: ''},
  ];
  export default {
    name: 'branchTask',
    data() {
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
            label: '操作', prop: 'operation', fixed: 'right', width: '84',
            render: (h, {props: {row}}) => {
              return (
                <div class="td-btn-group">
                  <a class={row.divideState === '已处理' ? 'divideState-completed' : ''}
                     onClick={() => this.handle(row)}>处理</a>
                </div>
              );
            },
          },
          {
            label: '订单标记', prop: 'grouponOrderFlag', width: 80,
            render: (h, {props: {row, col}}) => {
              let obj = this.$enum.orderTip._swap[row[col.prop]] || {};
              let text = obj.omit || '';
              let key = obj.value || '';
              return (
                <span class={text ? [key, 'tip-txt'] : ''}>{text}</span>
              );
            }
          },
          {
            label: '分线状态', prop: 'divideState', width: 80, formatter: row => {
              const textMap = ['待处理', '处理中', '已处理'];
              return textMap[row.divideState];
            }
          },
          {label: '合并编号', prop: 'combineId', width: 160},
          {label: '订单编号', prop: 'grouponOrderNumber', width: 220},
          {label: '生产编号', prop: 'produceOrderNumber', width: 160},
          {label: '用料代码', prop: 'materialCode', width: 80},
          {label: '瓦楞楞型', prop: 'tileModel', formatter: row => row.layers + row.tileModel, width: 80},
          {label: '订单数量', prop: 'pieceAmount', width: 80},
          {label: '处理数量', prop: 'processeAmount', width: 80},
          {
            label: '下料规格(cm)', prop: 'materialSize', width: 120,
          },
          {
            label: '产品规格', prop: 'productSize', width: 110
          },
          {label: '压线方式', prop: 'staveType', width: 80},
          {label: '纵压公式', prop: 'vformula', width: 200},
          {label: '横压公式', prop: 'hformula', width: 160},
          {label: '订单交期', prop: 'arriveTime', width: 110, formatter: row => {
              return row.arriveTime.split(' ')[0];
            }},
          {label: '客户名称', prop: 'customerName', width: 120},
          {label: '产品名称', prop: 'grouponProductName', width: 100},
          {label: '生成时间', prop: 'createTime', width: 180},
          {label: '处理人', prop: 'operator', width: 85},
          {label: '处理时间', prop: 'updateTime', width: 180},
        ],
        pageTotal: 0,
        searchData: {},
        loading: false,
        dialogLoading: false,
        checkedList: [],
        visible: false,
        extOrderKeys: {
          packageAmount: 'packNumber',
          consignee: 'reciver',
        },
      };
    },
    methods: {
      handle(row) {
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.dialog.open(row);
        });
      },
      close() {
        this.visible = false;
      },
      confirm() {
        this.$refs.search.search();
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
    },
    mounted() {
      this.$refs.search.search();
    },
    components: {orderTag, lookDialog}
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
      padding: 2px 10px;
      color: #3654ea;
      cursor: pointer;
    }

    .divideState-completed {
      color: #909399;
      pointer-events: none;
    }
  }

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
