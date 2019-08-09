<template>
  <div>
    <simple-table-box
      ref="table"
      :search-config="searchConfig"
      :table-columns="tableColumns"
      :download="downloadConfig"
      serviceUrl="listSummary"></simple-table-box>
  </div>
</template>

<script>
  import SimpleTableBox from './components/SimpleTableBox';
  export default {
    name: 'paperStockSummaryTable',
    components: {SimpleTableBox},
    data() {
      return {
        searchConfig: [
          {label: '选择日期：', key: 'timeRange', type: 'date', attrs: {
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
              }, valueFormat: "yyyy-MM-dd"
              }},
          {label: '原纸代码：', key: 'paperCode', type: 'input', reg: /^\w+$/g},
          {label: '门幅：', key: 'paperSize', type: 'input', attrs: {type: 'number'}},
          {label: '原纸供应商：', key: 'supplierName', type: 'input'},
        ],
        tableColumns: [
          {label: '原纸供应商', prop: 'supplierName'},
          {label: '原纸代码', prop: 'paperCode'},
          {label: '门幅(mm)', prop: 'paperSize'},
          {label: '入库件数', prop: 'inNum'},
          {label: '入库重量(Kg)', prop: 'inWeight'},
          {label: '入库长度(m)', prop: 'inLength'},
          {label: '入库面积(㎡)', prop: 'inArea'},
          {label: '出库件数', prop: 'outNum'},
          {label: '出库重量(Kg)', prop: 'outWeight'},
          {label: '出库长度(m)', prop: 'outLength'},
          {label: '出库面积(㎡)', prop: 'outArea'},
        ],
        downloadConfig: {
          url: 'printSummary',
          filename: '原纸出入库汇总表'
        }
      };
    },
    mounted() {
      this.$refs.table.getTableData();
    }
  };
</script>

<style lang="less" scoped>

</style>
