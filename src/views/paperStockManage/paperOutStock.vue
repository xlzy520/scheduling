<template>
  <single-page class="paperOutStock">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table ref="table"
                :data="tableData"
                height="100%"
                :columns="tableColumns"
                :column-type="['index']"
                @update-data="getList">
        <div slot="btn">
          <el-button type="primary" @click="openDialog('addOrEditDialog')">新增</el-button>
          <el-button type="primary" @click="fileDownload">导出记录</el-button>
          <el-button @click="isShowMoney = !isShowMoney">{{isShowMoney ? '隐藏' : '显示'}}金额</el-button>
        </div>
      </dj-table>
    </page-pane>
    <add-or-edit-dialog ref="addOrEditDialog" v-if="addOrEditDialogFlag" @close="addOrEditDialogFlag = false"></add-or-edit-dialog>
    <look-dialog ref="lookDialog" v-if="lookDialogFlag" @close="lookDialogFlag = false"></look-dialog>
  </single-page>
</template>
<script>
  import dayjs from 'dayjs';
  import {cylinderKeys} from "../../utils/system/constant/dataKeys";
  import addOrEditDialog from './paperOutStockModule/addOrEditDialog';
  import lookDialog from './paperOutStockModule/lookDialog';

  export default {
    name: 'paperOutStock',
    data: function () {
      return {
        searchConfig: [
          {
            type: 'date',
            key: cylinderKeys.storageTime,
            label: '入库时间',
            attrs: {
              type: 'daterange',
              default: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
              beforeChange: (val) => {
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
            type: 'select',
            key: cylinderKeys.storageType,
            label: '出库类型',
            attrs: {
              options: [{label: '全部', value: '0'}, ...this.$enum.outStockType._arr],
              default: '0'
            }
          },
        ],
        tableData: [],
        tableColumns: [
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
          },
          {
            prop: cylinderKeys.usePerson,
            label: '领用人',
            width: 118,
          },
          {
            prop: cylinderKeys.useDepartment,
            label: '领用部门',
            width: 145,
          },
          {
            prop: cylinderKeys.useGroup,
            label: '领用班组',
            width: 132,
          },
          {
            prop: cylinderKeys.forkliftDriver,
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
            label: '总重量',
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
                return '****'
              }
            }
          },
          {
            prop: cylinderKeys.remark,
            label: '备注信息',
            width: 225,
          },
        ],
        searchData: {},
        isShowMoney: true,
        addOrEditDialogFlag: false,
        lookDialogFlag: false,
      };
    },
    created() {
      this.tableData = [{}]
    },
    mounted() {
      this.$refs.search.search();
    },
    methods: {
      fileDownload() {
        console.log('调用下载接口，获取下载路径');
      },
      getList(page) {
        let post = {
          ...this.searchData,
          ...page
        };
        console.log(post);
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
