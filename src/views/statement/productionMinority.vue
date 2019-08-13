<template>
  <single-page class="productionMinority">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table ref="table"
                :data="tableData"
                height="100%"
                :columns="tableColumns"
                :column-type="['index']"
                @update-data="getList">
        <div slot="btn">
          <el-button type="primary">导出记录</el-button>
        </div>
      </dj-table>
    </page-pane>
  </single-page>
</template>
<script>
  export default {
    name: 'productionMinority',
    data: function () {
      return {
        searchConfig: [],
        tableData: [],
        tableColumns: [
          {
            prop: 'col',
            label: '第一列',
          }
        ],
        searchData: {}
      };
    },
    created() {
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
        console.log(post);
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      refresh() {
        this.$refs.table.updateData();
      },
    }
  };
</script>
<style lang="less" scoped>

</style>
