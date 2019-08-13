<template>
  <single-page class="orderStatistics">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table ref="table"
                :data="tableData"
                height="100%"
                :columns="tableColumns"
                :column-type="['index']"
                @update-data="getList">
      </dj-table>
    </page-pane>
  </single-page>
</template>
<script>
  const keys = {};
  export default {
    name: 'orderStatistics',
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
