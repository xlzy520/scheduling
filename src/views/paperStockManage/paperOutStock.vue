<template>
  <single-page class="paperOutStock">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table ref="table"
                v-if="isTableReady"
                :loading="isTableLoading"
                is-cache-columns
                :cache-columns-name="$store.getters.uids+'-'+ $route.name"
                :data="tableData"
                border
                height="100%"
                :total="total"
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
  </single-page>
</template>
<script>
  import dayjs from 'dayjs';
  import {cylinderKeys} from "../../utils/system/constant/dataKeys";
  import addOrEditDialog from './paperOutStockModule/addOrEditDialog';
  import lookDialog from './paperOutStockModule/lookDialog';
  import paperWarehouseService from '../../api/service/paperWarehouse';

  export default {
    name: 'paperOutStock',
    data: function () {
      return {
        searchConfig: [
          {
            type: 'date',
            key: cylinderKeys.outStockTime,
            label: '出库时间',
            attrs: {
              // clearable: false,
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
              maxlength: 13
            }
          },
          {
            type: 'select',
            key: cylinderKeys.storageType,
            label: '出库类型',
            attrs: {
              options: [{label: '全部', value: ''}, ...this.$enum.outStockType._arr],
              default: ''
            }
          },
        ],
        tableData: [],
        searchData: {},
        total: 0,
        // isShowMoney: true,
        addOrEditDialogFlag: false,
        lookDialogFlag: false,

        isTableLoading: false,
        isTableReady: false,
        isExporting: false,
      };
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
            width: 101,
            render: (h, {props: {row}}) => {
              return (
                <span class="td-btn-group">
                  <a on-click={()=>this.openDialog('lookDialog', row)}>查看</a>
                  <span></span>
                  <a on-click={()=>this.openDialog('addOrEditDialog', row)}>编辑</a>
                </span>
              );
            }
          },
          {
            prop: cylinderKeys.documentNo,
            label: '单据编号',
            width: 177,
          },
          {
            prop: cylinderKeys.storageTime,
            label: '出库时间',
            width: 224,
            formatter(row, index, cur) {
              return dayjs(cur).format('YYYY-MM-DD HH:mm:ss');
            }
          },
          {
            prop: cylinderKeys.usePersonName,
            label: '领用人',
            width: 118,
          },
          {
            prop: cylinderKeys.useDepartmentName,
            label: '领用部门',
            width: 145,
          },
          {
            prop: cylinderKeys.useGroup,
            label: '领用单元',
            width: 132,
          },
          {
            prop: cylinderKeys.forkliftDriverName,
            label: '叉车员',
            width: 131
          },
          {
            prop: cylinderKeys.storageType,
            label: '出库类型',
            width: 131
          },
          {
            prop: cylinderKeys.totalWeight,
            label: '总重量(Kg)',
            width: 118
          },
          {
            prop: cylinderKeys.totalAmount,
            label: '总件数',
            width: 117
          },
          {
            prop: cylinderKeys.totalMoney,
            label: '总金额',
            width: 108,
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
            width: 225,
          },
        ];
        let hidden_arr = [];
        if (!this.isShowMoney) {
          hidden_arr = [cylinderKeys.totalMoney, 'totalDiscount'];
        }
        return total_arr.filter(obj=>!hidden_arr.includes(obj.prop));
      }
    },
    created() {
      this.$store.dispatch('judgeAmountPermission').finally(()=>{
        this.isTableReady = true;
        this.$nextTick(()=>{
          this.$refs.search.search();
        })
      });
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
        this.dj_api_extend(paperWarehouseService.exportPaperOutStorage, this.searchData).then(res=>{
          this.$method.downloadExecl(res, `原纸出库表`);
        }).finally(()=>{
          this.isExporting = false;
        });
      },
      getList(page) {
        let post = {
          ...this.searchData,
          ...page,
          // startTime: this.searchData[cylinderKeys.outStockTime][0],
          // endTime: this.searchData[cylinderKeys.outStockTime][1],
        };
        this.isTableLoading = true;
        this.dj_api_extend(paperWarehouseService.listOutStorage, post).then(res=>{
          this.tableData = res.list || [];
          this.total = res.total || 0;
        }).finally(()=>{
          this.isTableLoading = false;
        });
      },
      search(query) {
        this.searchData = {
          ...query,
          startTime: query[cylinderKeys.outStockTime][0],
          endTime: query[cylinderKeys.outStockTime][1],
        };
        this.$refs.table.changePage(1);
      },
      openDialog(name, row) {
        this[name + 'Flag'] = true;
        this.$nextTick(() => {
          this.$refs[name].open(row);
        });
      },
    },
    components: {addOrEditDialog, lookDialog}
  };
</script>
<style lang="less" scoped>
/*/deep/ .operate {*/
/*a {*/
/*cursor: pointer;*/
/*}*/
/*a + span:empty {*/
/*&:before {*/
/*content: '|';*/
/*margin: 0 9px;*/
/*color: #EBEEF5;*/
/*}*/
/*}*/
/*}*/
</style>
