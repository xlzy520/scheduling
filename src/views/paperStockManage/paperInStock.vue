<template>
  <single-page class="paperInStock">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table ref="table"
                v-if="isTableReady"
                :loading="isTableLoad"
                is-cache-columns
                :cache-columns-name="$store.getters.uids+'-'+ $route.name"
                :data="tableData"
                :total="total"
                height="100%"
                :columns="tableColumns"
                :column-type="['index']"
                @update-data="getList">
        <div slot="btn">
          <el-button type="primary" @click="openDialog('addOrEditDialog')">新增</el-button>
          <el-button :loading="isExporting" type="primary" @click="fileDownload">导出记录</el-button>
          <!--<el-button @click="isShowMoney = !isShowMoney">{{isShowMoney ? '隐藏' : '显示'}}金额</el-button>-->
        </div>
      </dj-table>
    </page-pane>
    <add-or-edit-dialog ref="addOrEditDialog" v-if="addOrEditDialogFlag" @close="addOrEditDialogFlag = false" @success="refresh"></add-or-edit-dialog>
    <look-dialog ref="lookDialog" v-if="lookDialogFlag" @close="lookDialogFlag = false"></look-dialog>
    <set-unit-price-dialog ref="setUnitPriceDialog" v-if="setUnitPriceDialogFlag" @close="setUnitPriceDialogFlag = false" @success="refresh"></set-unit-price-dialog>
    <print-tag-dialog ref="printTagDialog" v-if="printTagDialogFlag" @close="printTagDialogFlag = false"></print-tag-dialog>
  </single-page>
</template>
<script>
  import addOrEditDialog from './paperInStockModule/addOrEditDialog';
  import printTagDialog from './paperInStockModule/printTagDialog';
  import lookDialog from './paperInStockModule/lookDialog';
  import setUnitPriceDialog from './paperInStockModule/setUnitPriceDialog';
  import dayjs from 'dayjs';
  import { cylinderKeys } from "../../utils/system/constant/dataKeys";
  import paperWarehouseService from '../../api/service/paperWarehouse';
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
              // clearable: false,
              // valueFormat: 'yyyy-MM-dd',
              type: 'datetimerange',
              default: this.$method.getDateRange('datetimerange', 1),
              // default: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
              // beforeChange: this.$method.getLimitTime,
            }
          },
          {
            type: 'input',
            key: cylinderKeys.cylinderNo,
            label: '纸筒编号',
            attrs: {
              reg: /^[0-9a-zA-Z]*$/,
            }
          },
          {
            type: 'input',
            key: cylinderKeys.paperSupplierName,
            label: '原纸供应商',
          },
          {
            type: 'select',
            key: cylinderKeys.storageType,
            label: '入库类型',
            attrs: {
              options: [{label: '全部', value: ''}, ...this.$enum.storageType._arr],
              default: ''
            }
          },
        ],
        tableData: [],
        // tableColumns: [
        //   {
        //     prop: 'operate',
        //     label: '操作',
        //     width: 270,
        //     render: (h, {props: {row}}) => {
        //       return (
        //         <span class="td-btn-group">
        //           <a on-click={()=>this.openDialog('lookDialog', {...row, isShowMoney: this.isShowMoney})}>查看</a>
        //           <span></span>
        //           <a on-click={()=>this.openDialog('addOrEditDialog', row)}>编辑</a>
        //           <span></span>
        //           <a on-click={()=>this.openDialog('printTagDialog', row)}>打印标签</a>
        //           <span></span>
        //           <a on-click={()=>this.openDialog('setUnitPriceDialog', row)}>设置单价</a>
        //         </span>
        //       );
        //     }
        //   },
        //   {
        //     prop: cylinderKeys.documentNo,
        //     label: '单据编号',
        //     width: 155
        //   },
        //   {
        //     prop: cylinderKeys.storageTime,
        //     label: '入库时间',
        //     width: 202,
        //     formatter(row, index, cur) {
        //       return dayjs(new Date(cur)).format('YYYY-MM-DD HH:mm:ss');
        //     }
        //   },
        //   {
        //     prop: cylinderKeys.paperSupplierName,
        //     label: '原纸供应商',
        //     width: 193
        //   },
        //   {
        //     prop: cylinderKeys.deliveryBillId,
        //     label: '送货单号',
        //     width: 172
        //   },
        //   {
        //     prop: cylinderKeys.deliveryNumber,
        //     label: '送货车号',
        //     width: 119
        //   },
        //   {
        //     prop: cylinderKeys.forkliftDriverName,
        //     label: '叉车员',
        //     width: 119
        //   },
        //   {
        //     prop: cylinderKeys.storageType,
        //     label: '入库类型',
        //     width: 109
        //   },
        //   {
        //     prop: cylinderKeys.totalWeight,
        //     label: '总重量(Kg)',
        //     width: 122
        //   },
        //   {
        //     prop: cylinderKeys.totalAmount,
        //     label: '总件数',
        //     width: 95
        //   },
        //   {
        //     prop: cylinderKeys.totalMoney,
        //     label: '总金额',
        //     formatter: (row, index, cur) => {
        //       if (this.isShowMoney) {
        //         return cur;
        //       } else {
        //         return '****'
        //       }
        //     }
        //   },
        //   {
        //     prop: cylinderKeys.remark,
        //     label: '备注信息',
        //     width: 203
        //   },
        // ],
        searchData: {},
        total: 0,
        // isShowMoney: true,
        addOrEditDialogFlag: false,
        lookDialogFlag: false,
        setUnitPriceDialogFlag: false,
        printTagDialogFlag: false,
        isTableLoad: false,
        isTableReady: false,
        isExporting: false
      };
    },
    created() {
      this.$store.dispatch('judgeAmountPermission').finally(()=>{
        this.isTableReady = true;
        this.$nextTick(()=>{
          this.$refs.search.search();
        })
      });
    },
    computed: {
      isShowMoney() {
        return this.$store.getters.amountPermission;
      },
      tableColumns() {
        let total_arr = [
          {
            prop: 'operate',
            label: '操作',
            width: this.isShowMoney ? 270 : 201,
            render: (h, {props: {row}}) => {
              let arr = [<span></span>, <a on-click={()=>this.openDialog('setUnitPriceDialog', row)}>设置单价</a>];
              return (
                <span class="td-btn-group">
                  <a on-click={()=>this.openDialog('lookDialog', row)}>查看</a>
                  <span></span>
                  <a on-click={()=>this.openDialog('addOrEditDialog', row)}>编辑</a>
                  <span></span>
                  <a on-click={()=>this.openDialog('printTagDialog', row)}>打印标签</a>
                  {this.isShowMoney ? arr : ''}
                </span>
              );
            }
          },
          {
            prop: cylinderKeys.documentNo,
            label: '单据编号',
            width: 165
          },
          {
            prop: cylinderKeys.storageTime,
            label: '入库时间',
            width: 202,
            formatter(row, index, cur) {
              return dayjs(new Date(cur)).format('YYYY-MM-DD HH:mm:ss');
            }
          },
          {
            prop: cylinderKeys.paperSupplierName,
            label: '原纸供应商',
            width: 193
          },
          {
            prop: cylinderKeys.deliveryBillId,
            label: '送货单号',
            width: 172
          },
          {
            prop: cylinderKeys.deliveryNumber,
            label: '送货车号',
            width: 119
          },
          {
            prop: cylinderKeys.forkliftDriverName,
            label: '叉车员',
            width: 119
          },
          {
            prop: cylinderKeys.storageType,
            label: '入库类型',
            width: 109
          },
          {
            prop: cylinderKeys.totalWeight,
            label: '总重量(Kg)',
            width: 122
          },
          {
            prop: cylinderKeys.totalAmount,
            label: '总件数',
            width: 95
          },
          {
            prop: cylinderKeys.totalMoney,
            label: '总金额',
            formatter: (row, index, cur) => {
              if (this.isShowMoney) {
                return cur;
              } else {
                return '****';
              }
            }
          },
          {
            prop: 'totalDiscount',
            label: '折扣总金额',
            width: 140,
            formatter: (row, index, cur) => {
              if (this.isShowMoney) {
                return cur;
              } else {
                return '****';
              }
            }
          },
          {
            prop: 'totalDamagedWeight',
            label: '破损总重量(Kg)',
            width: 150
          },
          {
            prop: cylinderKeys.remark,
            label: '备注信息',
            width: 203
          },
        ];
        let hidden_arr = [];
        if (!this.isShowMoney) {
          hidden_arr = [cylinderKeys.totalMoney, 'totalDiscount'];
        }
        return total_arr.filter(obj=>!hidden_arr.includes(obj.prop));
      }
    },
    mounted() {
      // this.$refs.search.search();
    },
    methods: {
      refresh() {
        this.$refs.table.updateData();
      },
      fileDownload() {
        this.isExporting = true;
        this.dj_api_extend(paperWarehouseService.exportPaperInStorage, this.searchData).then(res=>{
          this.$method.downloadExecl(res, `原纸入库表`);
        }).finally(()=>{
          this.isExporting = false;
        });
      },
      getList(page) {
        let post = {
          ...this.searchData,
          ...page,
          // startTime: this.searchData[cylinderKeys.storageTime][0],
          // endTime: this.searchData[cylinderKeys.storageTime][1],
        };
        this.isTableLoad = true;
        this.dj_api_extend(paperWarehouseService.listInStorage, post).then(res=>{
          this.tableData = res.list || [];
          this.total = res.total || 0;
        }).finally(()=>{
          this.isTableLoad = false;
        });
      },
      search(query) {
        this.searchData = {
          ...query,
          startTime: query[cylinderKeys.storageTime][0],
          endTime: query[cylinderKeys.storageTime][1],
        };
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
    components: {addOrEditDialog, lookDialog, setUnitPriceDialog, printTagDialog}};
</script>
<style lang="less" scoped>

</style>
