<template>
  <simple-table-box
    ref="table"
    :search-config="searchConfig"
    :table-columns="tableColumns"
    :download="downloadConfig"
    service-url="listInventory">
  </simple-table-box>
</template>

<script>
  import SimpleTableBox from './components/SimpleTableBox';
  export default {
    name: 'paperStockTable',
    components: {SimpleTableBox},
    data() {
      return {
        searchConfig: [
          {label: '原纸代码', key: 'paperCode', type: 'input', reg: /^\w+$/g},
          {label: '门幅', key: 'paperSize', type: 'input'},
          {label: '库存件数', key: 'counts', type: 'select', attrs: {options: [
                {label: '全部', value: '0'},
                {label: '0~5', value: '5'},
                {label: '6~10', value: '10'},
                {label: '10件以上', value: '11'},
              ]}},
        ],
        tableColumns: [
          {label: '原纸代码', prop: 'paperCode'},
          {label: '门幅(mm)', prop: 'paperSize'},
          {label: '库存件数', prop: 'totalCount'},
          {label: '库存米数', prop: 'totalLength'},
        ],
        downloadConfig: {
          url: 'printReport',
          filename: '原纸库存表'
        },
      };
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
</style>
