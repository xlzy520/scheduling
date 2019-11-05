<template>
  <single-page class="material-code">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :data="tableData"
        :loading="loading"
        is-cache-columns
        :cache-columns-name="$store.getters.uids+'-'+ $route.name"
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
  import lookDialog from "./materialCodeModule/lookDialog";
  import materialCodeService from '../../api/service/materialCode';
  import loadingMixins from '../../mixins/loading';
  import PagePane from "../../components/page/pagePane";

  export default {
    name: 'materialCode',
    components: {PagePane, lookDialog},
    mixins: [loadingMixins],
    data() {
      return {
        searchConfig: [
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '平台材料名称', key: 'platformMaterialCode', type: 'input'},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '用料代码', prop: 'materialCode'},
          {label: '平台材料名称', prop: 'platformMaterialCode'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
          {label: '启用状态', prop: 'isEffected', formatter: row => row.isEffected ? '启用' : '禁用'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="td-btn-group">
                  <a onClick={() => this.changeStatus(row)}>
                    {row.isEffected ? '禁用' : '启用'}</a>
                  <span></span>
                  <a onClick={() => this.open(false, row)}>编辑</a>
                </div>
              );
            },
          },
        ]),
        pageTotal: 0,
        dialogVisible: false,
        searchData: {}
      };
    },
    methods: {
      getList(page) {
        this.loading = true;
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(materialCodeService.list, post).then((res) => {
          this.tableData = res.list || [];
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
        this.$method.tipBox(`确定${text}该条内容吗？`, ()=>{
          return this.dj_api_extend(materialCodeService.changeEffected, post).then(() => {
            this.$message(`${text}成功`);
            row.isEffected = !row.isEffected;
          });
        });
      },
      open(isAdd, row) {
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open(isAdd, row);
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      close() {
        this.dialogVisible = false;
      },
      confirm() {
        this.$refs.search.search();
      }
    },
    mounted() {
      this.$refs.search.search();
    },
  };
</script>

<style lang="less" scoped>

</style>
