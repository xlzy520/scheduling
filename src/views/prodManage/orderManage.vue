<template>
  <div class="orderManage">
    <dj-search ref="search" :config="searchConfig" @search="getSearchData"></dj-search>
    <dj-table :data="tableData"
              ref="table"
              :columns="tableColumns"
              :column-type="['selection']"
              :total="total"
              @selection-change="selectionChange"
              @update-data="getList">
      <div slot="btn">
        <el-button type="primary" @click="openImportDialog" :disabled="checkedList.length === 0">导入计划</el-button>
        <el-button type="primary" @click="openImportDialog(true)">导入全部</el-button>
        <el-button type="primary" @click="openAddOrderDialog">备料订单</el-button>
      </div>
    </dj-table>
    <look-dialog v-if="lookDialogFlag" ref="lookDialog" @close="lookDialogFlag = false"></look-dialog>
    <import-dialog v-if="importDialogFlag" ref="importDialog" @close="importDialogFlag = false"></import-dialog>
    <add-or-edit-order-dialog v-if="addOrEditOrderDialogFlag" ref="addOrEditOrderDialog" @close="addOrEditOrderDialogFlag = false"></add-or-edit-order-dialog>
  </div>
</template>
<script>
  import dayjs from 'dayjs';
  import lookDialog from './orderManageModule/lookDialog';
  import importDialog from './orderManageModule/importDialog';
  import materialSizeInput from '../../components/materialSizeInput';
  import addOrEditOrderDialog from './orderManageModule/addOrEditOrderDialog';
  function getRange(type, startNum, startUnit = 'day', endNum = 0, endUnit = 'day') {
    let end = new Date(dayjs().add(endNum + 1, endUnit).format('YYYY-MM-DD'));
    let start = new Date(dayjs(end).subtract(startNum + endNum, startUnit).valueOf());
    if (type === 'daterange') {
      end = dayjs(end).subtract(1, 'day');
    }
    return [start, end];
  }
  export default {
    name: 'orderManage',
    data: function () {
      return {
        searchConfig: [
          {
            key: 'deliveryTime',
            label: '订单交期',
            type: 'date',
            attrs: {
              default: [dayjs(new Date()).subtract(30, 'day').format('YYYY-MM-DD'), dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')],
              beforeChange: (val) => {
                let _val = val;
                if (val[0] && val[1]) {
                  let towMonth = dayjs(val[0]).add(60, 'day');
                  if (towMonth.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过两个月', 'error');
                    _val = [val[0], towMonth.toDate()];
                  }
                }
                return _val;
              },
              pickerOptions: {
                shortcuts: [
                  {
                    text: '今日',
                    onClick(picker) {
                      picker.$emit('pick', getRange('daterange', 1));
                    }
                  },
                  {
                    text: '明日',
                    onClick(picker) {
                      picker.$emit('pick', getRange('daterange', 0, 'day', 1));
                    }
                  },
                  {
                    text: '本周',
                    onClick(picker) {
                      let start = dayjs().day(1).format('YYYY-MM-DD');
                      let end = dayjs().day(6).add(1, 'day').format('YYYY-MM-DD');
                      picker.$emit('pick', [start, end]);
                    }
                  },
                  {
                    text: '本月',
                    onClick(picker) {
                      let start = dayjs().startOf('month').format('YYYY-MM-DD');
                      let end = dayjs().endOf('month').format('YYYY-MM-DD');
                      picker.$emit('pick', [start, end]);
                    }
                  },
                  {
                    text: '近三月',
                    onClick(picker) {
                      picker.$emit('pick', getRange('daterange', 3, 'month'));
                    }
                  }
                ]
              },
              type: 'daterange'
            }
          },
          {
            key: 'orderTip',
            label: '订单标记',
            type: 'select',
            attrs: {
              options: this.$enum.orderTip._arr,
              default: this.$enum.orderTip.all.value
            }
          },
          {
            key: 'productStatus',
            label: '生产状态',
            type: 'select',
            attrs: {
              options: this.$enum.productStatus._arr,
              default: this.$enum.productStatus.waitImport.value
            }
          },
          {
            key: 'fluteType',
            label: '瓦楞楞型',
            type: 'custom',
            attrs: {
              default: ['']
            },
            component: {
              props: ['value', 'default'],
              render(h) {
                // 全选逻辑
                const input = (arr) => {
                  let realArr;
                  let lastValue = arr[arr.length - 1];
                  if (lastValue === '') {
                    realArr = [lastValue];
                  } else {
                    realArr = arr.filter(val => val !== '');
                  }
                  console.log(realArr);
                  this.$emit('input', realArr);
                };
                return (
                  <dj-select value={this.value}
                             collapse-tags
                             type="multiple"
                             default={this.default}
                             options={this.$enum.fluteType}
                             onInput={input}
                  ></dj-select>
                );
              }
            }
          },
          {
            key: 'materialName',
            label: '材料名称',
            type: 'input'
          },
          {
            key: 'orderType',
            label: '订单类型',
            type: 'select',
            attrs: {
              options: this.$enum.orderType._arr,
              default: this.$enum.orderType.all.value
            }
          },
          {
            key: 'productionNo',
            label: '生产编号',
            type: 'input',
            attrs: {
              placeholder: '请输入生产/订单编号'
            }
          },
          {
            key: 'customerName',
            label: '客户名称',
            type: 'input',
            attrs: {}
          },
          {
            key: 'materialSize',
            label: '下料规格',
            type: 'custom',
            component: materialSizeInput
          }
        ],
        tableData: [],
        tableColumns: [
          {
            prop: 'operate',
            lable: '操作',
            render: (h, {props: {row}}) => {
              return (
                <div>
                  <a href="javascript:;" onClick={()=>this.openLookDialog(row)}>查看</a>&nbsp;&nbsp;
                  <a href="javascript:;" onClick={()=>this.openAddOrderDialog(row)}>编辑</a>
                </div>
              );
            }
          },
          {
            prop: 'orderTip',
            label: '订单标记'
          },
          {
            prop: 'productionNo',
            label: '生产编号',
          },
          {
            prop: 'orderId',
            label: '订单编号',
          },
          {
            prop: 'customerName',
            label: '客户名称',
          },
          {
            prop: 'productName',
            label: '产品名称',
          },
          {
            prop: 'materialName',
            label: '材料名称'
          },
          {
            prop: 'fluteType',
            label: '瓦楞楞型'
          },
          {
            prop: 'orderAmount',
            label: '订单数量'
          },
          {
            prop: 'materialSize',
            label: '下料规格cm²'
          },
          {
            prop: 'orderStatus',
            label: '订单状态'
          },
          {
            prop: 'productStatus',
            label: '生产状态'
          },
          {
            prop: 'deliveryTime',
            label: '订单交期'
          }
        ],
        total: 0,
        searchData: {},
        checkedList: [],

        //查看弹框相关属性
        lookDialogFlag: false,

        //查看弹框相关属性
        importDialogFlag: false,

        //新增备料订单弹框相关属性
        addOrEditOrderDialogFlag: false
      };
    },
    created() {
      this.tableData = [{orderId: 11111}];
    },
    mounted() {
      this.$refs.search.search();
      this.$refs.table.changePage(1);
    },
    methods: {
      getSearchData(query) {
        this.searchData = query;
      },
      getList(page) {
        let post = {
          ...page,
          ...this.searchData
        };
        console.log(post);
      },
      selectionChange(checkedList) {
        this.checkedList = checkedList;
      },
      openImportDialog(bool) {
        this.importDialogFlag = true;
        this.$nextTick(()=>{
          let params = this.checkedList;
          if (bool === true) {
            params = bool;
          }
          this.$refs.importDialog.open(params);
        });
      },
      openLookDialog(row) {
        this.lookDialogFlag = true;
        this.$nextTick(()=>{
          this.$refs.lookDialog.open(row.orderId);
        });
      },
      openAddOrderDialog(order = {}) {
        this.addOrEditOrderDialogFlag = true;
        this.$nextTick(()=>{
          this.$refs.addOrEditOrderDialog.open(order.orderId);
        });
      }
    },
    components: { lookDialog, importDialog, addOrEditOrderDialog }
  };
</script>
