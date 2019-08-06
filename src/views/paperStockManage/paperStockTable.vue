<template>
  <div class="table-page">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <dj-table
      :data="tableData"
      :columns="tableColumns"
      :column-type="['index']"
      :total="pageTotal"
      @update-data="pageChange"
    >
      <div slot="btn">
        <el-button type="primary" @click="exportRecord">导出记录</el-button>
        <div>总件数： {{totaljianshu}}</div>
      </div>
    </dj-table>
  </div>
</template>

<script>
  import paperKindService from '../../api/service/paperKind';
  import {djForm} from 'djweb';
  export default {
    name: 'paperKind',
    data() {
      return {
        searchConfig: [
          {label: '原纸代码：', key: 'code', type: 'input', reg: /^\w+$/g},
          {label: '门幅：', key: 'menfu', type: 'input', attrs: {type: 'number'}},
          {label: '库存件数：', key: 'jianshu', type: 'select', attrs: {option: [
                {label: '全部', value: ''},
                {label: '0~5', value: '5'},
                {label: '6~10', value: '6'},
                {label: '10件以上', value: '10'},
              ]}},
        ],
        tableData: [],
        tableColumns: [
          {label: '原纸代码', prop: 'code'},
          {label: '门幅（mm）', prop: 'menfu'},
          {label: '库存件数', prop: 'jianshu'},
          {label: '库存米数', prop: 'mishu'},
        ],
        pageOptions: {
          pageNo: 1,
          pageSize: 20
        },
        pageTotal: 0,
        totaljianshu: 0
      };
    },
    methods: {
      exportRecord(){

      },
      getTableData(data) {
        paperKindService.list(data).then((res) => {
          this.tableData = res.list;
          this.pageTotal = 100;
        });
      },
      search(data) {
        this.getTableData({
          ...data,
          ...this.pageOptions,
        });
      },
      pageChange(option) {
        this.pageOptions = option;
        this.$refs.search.search();
      },

    },
    created() {
      this.getTableData();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .table-page {
    padding-top: 20px;
  }
</style>
