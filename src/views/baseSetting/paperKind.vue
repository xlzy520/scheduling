<template>
  <single-page class="table-page paper-kind">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :loading="loading"
        :data="tableData"
        :columns="tableColumns"
        :column-type="['index']"
        :total="pageTotal" height="100%"
        @update-data="getList"
      >
        <div slot="btn">
          <el-button type="primary" @click="open(true)">新增</el-button>
        </div>
      </dj-table>
    </page-pane>
    <look-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"></look-dialog>
  </single-page>
</template>

<script>
  import lookDialog from "./paperKindModule/lookDialog";
  import paperKindService from '../../api/service/paperKind';
  import loadingMixins from '../../mixins/loading';
  import PagePane from "../../components/page/pagePane";

  export default {
    name: 'paperKind',
    components: {PagePane, lookDialog},
    mixins: [loadingMixins],
    data() {
      return {
        searchConfig: [
          {label: '原纸编号', key: 'paperNumber', type: 'input'},
          {label: '原纸代码', key: 'paperCode', type: 'input'},
          {label: '门幅', key: 'paperSize', type: 'input'},
        ],
        tableData: [],
        tableColumns: [
          {label: '原纸编号', prop: 'paperNumber'},
          {label: '原纸代码', prop: 'paperCode'},
          {label: '原纸类型', prop: 'paperTypeName'},
          {label: '克重（g）', prop: 'paperGram'},
          {label: '门幅（mm）', prop: 'paperSize'},
          {label: '仓库名称', prop: 'warehouseName'},
          {label: '库区名称', prop: 'warehouseAreaName'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
          {label: '启用状态', prop: 'isEffected',
            render: (h, {props: {row}}) => {
              return (
                <div class={row.isEffected ? '' : 'status-off'}>
                  {row.isEffected ? '已启用' : '已禁用'}
                </div>
              );
            }
          },
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="td-btn-group">
                  <a onClick={() => this.changeStatus(row)}>
                    {row.isEffected ? '禁用' : '启用'}</a>
                  <span></span>
                  <a onClick={() => this.open(false,row)}>编辑</a>
                </div>
              );
            },
          },
        ],
        pageTotal: 0,
        dialogTypeIsAdd: null,
        dialogVisible: false,
        searchData: {}
      };
    },
    methods: {
      open(isAdd, row) {
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open(isAdd, row);
        });
      },
      add() {
        this.dialogVisible = true;
        this.getWarehouse();
        this.$nextTick(()=>{
          this.$refs.dialog.open();
          // this.getWarehouse();
        });
      },
      getList(page) {
        this.loading = true;
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(paperKindService.list, post).then((res) => {
          let list = res.list || [];
          list.forEach(obj=>{
            obj.paperTypeName = this.$enum.paperType._swap[obj.paperType] && this.$enum.paperType._swap[obj.paperType].label;
          });
          this.tableData = list;
          this.pageTotal = res.total;
        }).finally(() => {
          this.loading = false;
        });
      },
      changeStatus(row) {
        // 接口
        let post = {
          id: row.id,
          effected: row.isEffected ? 0 : 1,
        };
        let text = row.isEffected ? '禁用' : '启用';
        this.$method.tipBox(`确定${text}该条内容吗？`, () => {
          return this.dj_api_extend(paperKindService.changeEffected, post).then(() => {
            this.$message(`${text}成功`, 'success');
            row.isEffected = !row.isEffected;
          });
        });
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dialogLoading = true;
        this.getWarehouse();
        this.getPaperKindById(row.id).then((res)=>{
          this.getWarehouseArea(res.warehouseId);
        }).finally(() => {
          this.dialogLoading = false;
        });
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      confirm(cb) {
        this.$refs.search.search();
      },
      close() {
        this.dialogVisible = false;
      }
    },
    mounted() {
      this.$refs.search.search();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .status-off {
    color: #909399;
  }
</style>
