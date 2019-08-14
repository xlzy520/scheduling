<template>
  <simple-table-box
    ref="table"
    :search-config="searchConfig"
    :table-columns="tableColumns"
    :download="downloadConfig"
    serviceUrl="listDetail">
  </simple-table-box>
</template>

<script>
  import paperWarehouseService from '../../api/service/paperWarehouse';
  import SimpleTableBox from './components/SimpleTableBox';
  export default {
    name: 'paperStockDetailTable',
    components: {SimpleTableBox},
    data() {
      return {
        searchConfig: [
          {label: '原纸代码：', key: 'paperCode', type: 'input', reg: /^\w+$/g},
          {label: '门幅：', key: 'paperSize', type: 'input', attrs: {type: 'number'}},
          {label: '仓库：', key: 'warehouseId', type: 'select', attrs: {
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
          {label: '库区：', key: 'warehouseAreaId', type: 'select', attrs: {
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
          {label: '原纸供应商：', key: 'supplierName', type: 'input'},
        ],
        tableColumns: [
          {label: '入库时间', prop: 'createTime'},
          {label: '原纸供应商', prop: 'supplierName'},
          {label: '纸筒编号', prop: 'paperTubeNumber'},
          {label: '原纸代码', prop: 'paperCode'},
          {label: '原纸类型', prop: 'paperType'},
          {label: '克重（g）', prop: 'gram'},
          {label: '门幅（mm）', prop: 'paperSize'},
          {label: '重量（Kg）', prop: 'weight'},
          {label: '长度（m）', prop: 'length'},
          {label: '仓库', prop: 'warehouseName'},
          {label: '库区', prop: 'warehouseAreaName'},
          {label: '入库类型', prop: 'storageType'},
        ],
        downloadConfig: {
          url: 'printDetail',
          filename: '原纸出入库明细表'
        },
        totalQuantity: 0,
        totalQuality: 0,
      };
    },
    mounted() {
      this.$refs.table.getTableData();
      paperWarehouseService.getPaperWarehouse({}).then(res=>{
        console.log(res);
        // todo 完成仓库、库区选择
      });
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .table-page {
    padding-top: 20px;
  }
  .ext-data{
    display: flex;
  }
</style>
