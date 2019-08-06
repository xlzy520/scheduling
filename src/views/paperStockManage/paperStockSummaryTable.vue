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
          {label: '选择日期：', key: 'timerange', type: 'date', attrs: {
            type: 'daterange', pickerOptions: {
                shortcuts: [
                  {text: '今天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      picker.$emit('pick', [start, end]);
                    }},
                  {text: '近七天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                      picker.$emit('pick', [start, end]);
                    }},
                  {
                    text: '近30天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                      picker.$emit('pick', [start, end]);
                    }
                  }
                ]
              },
              }},
          {label: '原纸代码：', key: 'code', type: 'input', reg: /^\w+$/g},
          {label: '门幅：', key: 'menfu', type: 'input', attrs: {type: 'number'}},
          {label: '原纸供应商：', key: 'supplier', type: 'input'},
        ],
        tableData: [],
        tableColumns: [
          {label: '原纸供应商', prop: 'code'},
          {label: '原纸代码', prop: 'code'},
          {label: '门幅（mm）', prop: 'menfu'},
          {label: '入库件数', prop: 'jianshu'},
          {label: '入库重量（Kg）', prop: 'menfu'},
          {label: '入库长度（m）', prop: 'jianshu'},
          {label: '入库面积（㎡)', prop: 'jianshu'},
          {label: '出库件数', prop: 'jianshu'},
          {label: '出库重量（Kg）', prop: 'jianshu'},
          {label: '出库长度（m）', prop: 'jianshu'},
          {label: '出库面积（㎡)', prop: 'jianshu'},
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
