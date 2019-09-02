<template>
  <single-page class="orderManage">
    <dj-search ref="search" :config="searchConfig" @search="getSearchData"></dj-search>
    <page-pane>
      <dj-table :data="tableData"
                ref="table"
                :columns="tableColumns"
                :column-type="['selection']"
                :total="total"
                height="100%"
                @selection-change="selectionChange"
                @update-data="getList">
        <div slot="btn">
          <el-button type="primary" @click="openImportDialog()">导入计划</el-button>
          <el-button type="primary" @click="openImportDialog(true)">导入全部</el-button>
          <el-button type="primary" @click="openAddOrderDialog()">备料订单</el-button>
        </div>
      </dj-table>
    </page-pane>
    <look-dialog v-if="lookDialogFlag" ref="lookDialog" @close="lookDialogFlag = false" @success="refresh"></look-dialog>
    <import-dialog v-if="importDialogFlag" ref="importDialog" @close="importDialogFlag = false" @success="refresh"></import-dialog>
    <add-or-edit-order-dialog v-if="addOrEditOrderDialogFlag" ref="addOrEditOrderDialog" @close="addOrEditOrderDialogFlag = false" @success="refresh"></add-or-edit-order-dialog>
  </single-page>
</template>
<script>
  import dayjs from 'dayjs';
  import lookDialog from './orderManageModule/lookDialog';
  import importDialog from './orderManageModule/importDialog';
  import materialSizeInput from '../../components/materialSizeInput';
  import addOrEditOrderDialog from './orderManageModule/addOrEditOrderDialog';
  import orderManageService from '../../api/service/orderManage';
  import { orderKeys } from "../../utils/system/constant/dataKeys";
  // const orderKeys = {
  //   productionNo: 'productionNo',
  //   orderId: 'orderId',
  //   customerName: 'customerName',
  //   productName: 'productName',
  //   materialName: 'materialName',
  //   fluteType: 'fluteType',
  //   orderAmount: 'orderAmount',
  //   materialSize: 'materialSize',
  //   orderStatus: 'orderStatus',
  //   productStatus: 'productStatus',
  //   deliveryTime: 'deliveryTime',
  // };
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
            key: orderKeys.deliveryTime,
            label: '订单交期',
            type: 'date',
            attrs: {
              clearable: false,
              default: [dayjs(new Date()).subtract(30, 'day').format('YYYY-MM-DD'), dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')],
              beforeChange: (val) => {
                let _val = val;
                if (val[0] && val[1]) {
                  let towMonth = dayjs(val[0]).add(92, 'day');
                  if (towMonth.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], towMonth.toDate()];
                  }
                  val[0] = dayjs(val[0]).format('YYYY-MM-DD');
                  val[1] = dayjs(val[1]).format('YYYY-MM-DD');
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
            },
          },
          {
            key: orderKeys.orderTip,
            label: '订单标记',
            type: 'select',
            attrs: {
              options: this.$enum.orderTip._arr,
              default: this.$enum.orderTip.all.value
            }
          },
          {
            key: orderKeys.productStatus,
            label: '生产状态',
            type: 'select',
            attrs: {
              options: this.$enum.productStatus._arr,
              default: this.$enum.productStatus.waitImport.value
            }
          },
          {
            key: orderKeys.fluteType,
            label: '瓦楞楞型',
            type: 'custom',
            attrs: {
              default: ['all']
            },
            component: {
              props: ['value', 'default'],
              render(h) {
                // 全选逻辑
                const input = (arr) => {
                  let realArr;
                  let lastValue = arr[arr.length - 1];
                  if (lastValue === 'all') {
                    realArr = [lastValue];
                  } else {
                    realArr = arr.filter(val => val !== 'all');
                  }
                  if (!arr.length) {
                    realArr = ['all'];
                  }
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
            key: orderKeys.materialName,
            label: '材料名称',
            type: 'input'
          },
          {
            key: orderKeys.orderType,
            label: '订单类型',
            type: 'select',
            attrs: {
              options: this.$enum.orderType._arr,
              default: this.$enum.orderType.all.value
            }
          },
          {
            key: 'produceOrderNumber',
            label: '生产编号',
            type: 'input',
            attrs: {
              placeholder: '请输入生产/订单编号'
            }
          },
          {
            key: orderKeys.customerName,
            label: '客户名称',
            type: 'input',
            attrs: {}
          },
          {
            key: orderKeys.materialSize,
            label: '下料规格',
            type: 'custom',
            attrs: {
              default: []
            },
            component: materialSizeInput
          }
        ],
        tableData: [],
        tableColumns: [
          {
            prop: 'operate',
            label: '操作',
            fixed: 'right',
            render: (h, {props: {row}}) => {
              let edit;
              if (this.$enum.orderType.preparingMaterials.value === row[orderKeys.orderType] && this.$enum.productStatus.waitImport.value === row[orderKeys.productStatus]) {
                edit = [(<span></span>), (<a onClick={()=>this.openAddOrderDialog(row)}>编辑</a>)];
              }
              return (
                <div class="td-btn-group">
                  <a onClick={()=>this.openLookDialog(row)}>查看</a>
                  {edit}
                </div>
              );
            }
          },
          {
            prop: orderKeys.orderTip,
            label: '订单标记',
            width: 112,
            render: (h, {props:{row, col}}) => {
              let obj = this.$enum.orderTip._swap[row[col.prop]] || {};
              let text = obj.omit || '';
              let key = obj.value || '';
              return (
                <span class={key? key : '' }>{text}</span>
              )
            }
          },
          {
            prop: orderKeys.productionNo,
            label: '生产编号',
          },
          {
            prop: orderKeys.orderId,
            label: '订单编号',
            formatter(a, b, cur) {
              return cur || '——'
            }
          },
          {
            prop: orderKeys.customerName,
            label: '客户名称',
          },
          {
            prop: orderKeys.productName,
            label: '产品名称',
            formatter(a, b, cur) {
              return cur || '——'
            }
          },
          {
            prop: orderKeys.materialName,
            label: '材料名称'
          },
          {
            prop: orderKeys.fluteType,
            label: '瓦楞楞型',
            formatter(row, index, cur) {
              return row[orderKeys.layer] + cur;
            }
          },
          {
            prop: orderKeys.orderAmount,
            label: '订单数量'
          },
          {
            prop: orderKeys.materialSize,
            label: '下料规格(cm)',
            formatter(row) {
              return row[orderKeys.materialLength] + '*' + row[orderKeys.materialWidth];
            }
          },
          {
            prop: orderKeys.orderStatus,
            label: '订单状态',
            formatter: (row, index, cur) => {
              let obj = this.$enum.orderStatus._swap[cur] || {};
              return obj.label || '';
            }
          },
          {
            prop: orderKeys.productStatus,
            label: '生产状态',
            formatter: (row, index, cur) => {
              let obj = this.$enum.productStatus._swap[cur] || {};
              return obj.label || '';
            }
          },
          {
            prop: orderKeys.deliveryTime,
            label: '订单交期',
            formatter(row, index, cur) {
              return dayjs(cur).format('YYYY-MM-DD');
            }
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
      // this.tableData = [{orderId: 11111, orderType: '3', productStatus: '0'}, {orderId: 2222}];
    },
    mounted() {
      this.$refs.search.search();
    },
    methods: {
      getSearchData(query) {
        this.searchData = query;
        this.searchData = {
          ...query,
          startArriveTime: query[orderKeys.deliveryTime][0],
          endArriveTime: dayjs(query[orderKeys.deliveryTime][1]).add(1, 'day').format('YYYY-MM-DD'),
        };
        this.$refs.table.changePage(1);
      },
      refresh() {
        this.$refs.table.updateData();
      },
      getList(page) {
        let tileModel = this.searchData[orderKeys.fluteType].filter(str=>str !== 'all');
        let post = {
          ...page,
          ...this.searchData,
          // startArriveTime: this.searchData[orderKeys.deliveryTime][0],
          // endArriveTime: this.searchData[orderKeys.deliveryTime][1],
          materialLength: this.searchData[orderKeys.materialSize][0],
          materialWidth: this.searchData[orderKeys.materialSize][1],
          tileModel: tileModel.length ? tileModel : null
        };
        this.dj_api_extend(orderManageService.list, post).then(res=>{
          this.tableData = res.list || [];
          this.total = res.total;
        });
      },
      selectionChange(checkedList) {
        this.checkedList = checkedList;
      },
      openImportDialog(bool) {
        if (!bool && !this.checkedList.length) {
          this.$message('请选择需要导入的订单', 'error');
          return;
        }
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
          this.$refs.lookDialog.open(row);
        });
      },
      openAddOrderDialog(order) {
        this.addOrEditOrderDialogFlag = true;
        this.$nextTick(()=>{
          this.$refs.addOrEditOrderDialog.open(order);
        });
      }
    },
    components: { lookDialog, importDialog, addOrEditOrderDialog }
  };
</script>
<style lang="less" scoped>
  .dj-table-container {
    /deep/ .urgent {
      color: #FF0000;
    }
    /deep/ .delay {
      color: #F89816;
    }
  }
</style>
