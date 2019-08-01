<template>
  <div class="paperInStock">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <dj-table ref="table"
              :data="tableData"
              :total="total"
              height="500px"
              :columns="tableColumns"
              :column-type="['index']"
              @update-data="getList">
      <div slot="btn">
        <el-button type="primary" @click="openDialog('addOrEditDialog')">新增</el-button>
        <el-button type="primary">导出记录</el-button>
        <el-button @click="isShowMoney = !isShowMoney">{{isShowMoney ? '隐藏' : '显示'}}金额</el-button>
      </div>
    </dj-table>
    <add-or-edit-dialog ref="addOrEditDialog" v-if="addOrEditDialogFlag" @close="addOrEditDialogFlag = false"></add-or-edit-dialog>
    <look-dialog ref="lookDialog" v-if="lookDialogFlag" @close="lookDialogFlag = false"></look-dialog>
    <set-unit-price-dialog ref="setUnitPriceDialog" v-if="setUnitPriceDialogFlag" @close="setUnitPriceDialogFlag = false"></set-unit-price-dialog>
  </div>
</template>
<script>
  import addOrEditDialog from './paperInStockModule/addOrEditDialog';
  import lookDialog from './paperInStockModule/lookDialog';
  import setUnitPriceDialog from './paperInStockModule/setUnitPriceDialog';
  import dayjs from 'dayjs';
  import { cylinderKeys } from "../../utils/system/constant/dataKeys";
  import paperInStock from '../../api/service/paperInStock';
  export default {
    name: 'paperInStock',
    data: function () {
      return {
        searchConfig: [
          {
            type: 'date',
            key: cylinderKeys.storageTime,
            label: '入库时间',
            attrs: {
              default: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
              beforeChange: (val) => {
                console.log(dayjs(val[0]).valueOf());
                console.log(dayjs(val[1]).valueOf());
                let _val = val;
                if (val[0] && val[1]) {
                  let towMonth = dayjs(val[0]).add(92, 'day');
                  if (towMonth.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], towMonth.toDate()];
                  }
                }
                return _val;
              },
            }
          },
          {
            type: 'input',
            key: cylinderKeys.cylinderNo,
            label: '纸筒编号',
            attrs: {
              reg: /^\d{0,12}$/,
              maxlength: 12
            }
          },
          {
            type: 'input',
            key: cylinderKeys.paperSupplier,
            label: '原纸供应商',
            atrrs: {
              maxlength: 30
            }
          },
          {
            type: 'select',
            key: cylinderKeys.storageType,
            label: '入库类型',
            attrs: {
              options: [{label: '全部', value: '0'}, ...this.$enum.storageType._arr],
              default: '0'
            }
          },
        ],
        tableData: [],
        tableColumns: [
          {
            prop: 'operate',
            label: '操作',
            width: 200,
            render: (h, {props: {row}}) => {
              return (
                <span>
                  <a href="javascript:;" on-click={()=>this.openDialog('lookDialog', row)}>查看</a>&nbsp;&nbsp;
                  <a href="javascript:;" on-click={()=>this.openDialog('addOrEditDialog', row)}>编辑</a>&nbsp;&nbsp;
                  <a href="javascript:;">打印标签</a>&nbsp;&nbsp;
                  <a href="javascript:;" on-click={()=>this.openDialog('setUnitPriceDialog', row)}>设置单价</a>
                </span>
              );
            }
          },
          {
            prop: cylinderKeys.documentNo,
            label: '单据编号'
          },
          {
            prop: cylinderKeys.storageTime,
            label: '入库时间'
          },
          {
            prop: cylinderKeys.paperSupplier,
            label: '原纸供应商'
          },
          {
            prop: cylinderKeys.deliveryBillId,
            label: '送货单号'
          },
          {
            prop: cylinderKeys.deliveryNumber,
            label: '送货车号'
          },
          {
            prop: cylinderKeys.storageType,
            label: '入库类型'
          },
          {
            prop: cylinderKeys.totalWeight,
            label: '总重量(Kg)'
          },
          {
            prop: cylinderKeys.totalAmount,
            label: '总件数'
          },
          {
            prop: cylinderKeys.totalMoney,
            label: '总金额',
            formatter: (row, index, cur) => {
              if (this.isShowMoney) {
                return cur;
              } else {
                return '****'
              }
            }
          },
          {
            prop: cylinderKeys.remark,
            label: '备注信息'
          },
        ],
        searchData: {},
        total: 0,
        isShowMoney: true,
        addOrEditDialogFlag: false,
        lookDialogFlag: false,
        setUnitPriceDialogFlag: false,
      };
    },
    created() {
      this.tableData = [{deliveryBillId: 11111, id: 'dsfsdf'}]
    },
    mounted() {
      this.$refs.search.search();
    },
    methods: {
      getList(page) {
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(paperInStock.list, post).then(res=>{
          this.tableData = res.list || [];
          this.total = res.total || 0;
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      openDialog(name, row) {
        this[name + 'Flag'] = true;
        this.$nextTick(() => {
          this.$refs[name].open(row);
        });
      },
      // openAddOrEditDialog(row) {
      //   this.addOrEditDialogFlag = true;
      //   this.$nextTick(() => {
      //     this.$refs.addOrEditDialog.open(row);
      //   });
      // },
      // openLookDialog(row) {
      //   this.lookDialogFlag = true;
      //   this.$nextTick(() => {
      //     this.$refs.lookDialog.open(row);
      //   });
      // }
    },
    components: {addOrEditDialog, lookDialog, setUnitPriceDialog}
  };
</script>
<style lang="less" scoped>

</style>
