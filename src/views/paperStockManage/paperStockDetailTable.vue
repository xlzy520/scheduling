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
        <div>总件数： {{totalQuantity}}</div>
        <div>总重量： {{totalQuality}}</div>
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
          {label: '仓库：', key: 'warehouseName', type: 'select', attrs: {
              options: [{
                label: '丽岙原纸仓库1',
                value: 'chu',
              }, {
                label: '丽岙原纸仓库2',
                value: 'gao',
              }, {
                label: '丽岙原纸仓库3',
                value: 'da',
              }],
            }},
          {label: '库区：', key: 'warehouseAreaName', type: 'select', attrs: {
              options: [{
                label: '丽岙原纸仓库1',
                value: 'chu',
              }, {
                label: '丽岙原纸仓库2',
                value: 'gao',
              }, {
                label: '丽岙原纸仓库3',
                value: 'da',
              }],
            }},
          {label: '原纸供应商：', key: 'supplier', type: 'input'},
        ],
        tableData: [],
        tableColumns: [
          {label: '入库时间', prop: 'code'},
          {label: '原纸供应商', prop: 'code'},
          {label: '纸筒编号', prop: 'code'},
          {label: '原纸代码', prop: 'code'},
          {label: '原纸类型', prop: 'code'},
          {label: '克重（g）', prop: 'code'},
          {label: '门幅（mm）', prop: 'menfu'},
          {label: '重量（Kg）', prop: 'menfu'},
          {label: '长度（m）', prop: 'jianshu'},
          {label: '仓库', prop: 'jianshu'},
          {label: '库区', prop: 'jianshu'},
          {label: '入库类型', prop: 'jianshu'},
        ],
        pageOptions: {
          pageNo: 1,
          pageSize: 20
        },
        pageTotal: 0,
        totalQuantity: 0,
        totalQuality: 0,
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
