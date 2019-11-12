<template>
  <single-page class="paper-supplier">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :data="tableData"
        is-cache-columns
        :cache-columns-name="$store.getters.uids+'-'+ $route.name"
        :loading="loading"
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
  import lookDialog from "./paperSupplierModule/lookDialog";
  import paperSupplierService from '../../api/service/paperSupplier';
  import loadingMixins from '../../mixins/loading';
  import PagePane from "../../components/page/pagePane";
  export default {
    name: 'paperSupplier',
    components: {PagePane, lookDialog},
    mixins: [loadingMixins],
    data() {
      return {
        searchConfig: [
          {label: '供应商编号', key: 'supplierNumber', type: 'input'},
          {label: '供应商', key: 'supplierName', type: 'input'},
        ],
        tableData: [],
        tableColumns: [
          {label: '供应商编号', prop: 'supplierNumber'},
          {label: '供应商名称', prop: 'supplierName'},
          {label: '地址', prop: 'address', width: 200},
          {label: '社会信用代码', prop: 'socialCreditCode'},
          {label: '法人代表', prop: 'legalRepresentative'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="td-btn-group">
                  <a onClick={() => this.open(false, row)}>编辑</a>
                </div>
              );
            },
          },
        ],
        pageTotal: 0,
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
      getList(page) {
        this.loading = true;
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(paperSupplierService.list, post).then((res) => {
          this.tableData = res.list || [];
          this.pageTotal = res.total;
        }).finally(() => {
          this.loading = false;
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
      },
    },
    mounted() {
      this.confirm();
    },
  };
</script>

<style lang="less" scoped>

</style>
