<template>
  <div class="paperOutStock">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <dj-table ref="table"
              :data="tableData"
              :columns="tableColumns"
              :column-type="['index']"
              @update-data="getList">
      <div slot="btn">
        <el-button type="primary" @click="openDialog('addOrEditDialog')">新增</el-button>
        <el-button type="primary" @click="fileDownload">导出记录</el-button>
        <el-button @click="isShowMoney = !isShowMoney">{{isShowMoney ? '隐藏' : '显示'}}金额</el-button>
      </div>
    </dj-table>
    <add-or-edit-dialog ref="addOrEditDialog" v-if="addOrEditDialogFlag" @close="addOrEditDialogFlag = false"></add-or-edit-dialog>
    <look-dialog ref="lookDialog" v-if="lookDialogFlag" @close="lookDialogFlag = false"></look-dialog>
  </div>
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
            render: (h, {props: {row}}) => {
              return (
                <span>
                  <a href="javascript:;" on-click={()=>this.openDialog('lookDialog', row)}>查看</a>&nbsp;&nbsp;
                  <a href="javascript:;" on-click={()=>this.openDialog('addOrEditDialog', row)}>编辑</a>
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
            label: '出库时间'
          },
          {
            prop: cylinderKeys.usePerson,
            label: '领用人'
          },
          {
            prop: cylinderKeys.useDepartment,
            label: '领用部门'
          },
          {
            prop: cylinderKeys.useGroup,
            label: '领用班组'
          },
          {
            prop: cylinderKeys.forkliftDriver,
            label: '叉车员'
          },
          {
            prop: cylinderKeys.storageType,
            label: '出库类型'
          },
          {
            prop: cylinderKeys.totalWeight,
            label: '总重量'
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

</style>
