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
  import dayjs from 'dayjs';
  export default {
    name: 'paperStockDetailTable',
    components: {SimpleTableBox},
    data() {
      return {
        searchConfig: [
          {label: '原纸代码：', key: 'paperCode', type: 'input', reg: /^\w+$/g},
          {label: '门幅：', key: 'paperSize', type: 'input',},
          {label: '仓库：', type: 'select', key: 'warehouseId', attrs: {
              keyMap: {
                label: 'name',
                value: 'warehouseId'
              },
              options: [],
            },
            listeners: {
              input: (val) => {
                if (!['', undefined, null].includes(val)) {
                  this.dj_api_extend(this.getWarehouseArea, val);
                }
              },
              'clear': ()=>{
                this.searchConfig[3].attrs.options = [];
              },
            }
          },
          {label: '库区：', key: 'warehouseAreaId', type: 'select', attrs: {
              keyMap: {
                label: 'name',
                value: 'warehouseAreaId'
              },
              options: [],
            },
            linkListeners: {
              warehouseId: {
                input: (val, com) => {
                  if (com) {
                    com.$emit('input', '');
                  }
                }
              }
            }},
          {label: '原纸供应商：', key: 'supplierName', type: 'input'},
        ],
        tableColumns: [
          {label: '入库时间', prop: 'createTime', width: 180,
            formatter(row, index, cur) {
              return dayjs(cur).format('YYYY-MM-DD HH:mm:ss');
            }},
          {label: '原纸供应商', prop: 'supplierName', width: 120},
          {label: '纸筒编号', prop: 'paperTubeNumber', width: 160},
          {label: '原纸代码', prop: 'paperCode', width: 120},
          {label: '原纸类型', prop: 'paperType', width: 120,
            formatter: (row, index, cur) => {
              let obj = this.$enum.paperType._swap[cur] || {};
              return obj.label || '';
            }
          },
          {label: '克重（g）', prop: 'gram', width: 120},
          {label: '门幅（mm）', prop: 'paperSize', width: 120},
          {label: '重量（Kg）', prop: 'weight', width: 120},
          {label: '长度（m）', prop: 'length', width: 120},
          {label: '仓库', prop: 'warehouseName', width: 120},
          {label: '库区', prop: 'warehouseAreaName', width: 120},
          {label: '入库类型', prop: 'storageType', width: 120},
        ],
        downloadConfig: {
          url: 'printDetail',
          filename: '原纸库存明细表'
        },
        totalQuantity: 0,
        totalQuality: 0,
      };
    },
    methods: {
      getWarehouse() {
        return this.dj_api_extend(paperWarehouseService.getPaperWarehouse).then((res) => {
          this.searchConfig[2].attrs.options = res.list || [];
        });
      },
      getWarehouseArea(id) {
        return this.dj_api_extend(paperWarehouseService.getAreaAllList, {warehouseId: id}).then((res) => {
          this.searchConfig[3].attrs.options = res.list || [];
        });
      },
    },
    mounted() {
      this.getWarehouse();
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .ext-data{
    display: flex;
  }
</style>
