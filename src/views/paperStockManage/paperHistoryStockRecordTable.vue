<template>
  <simple-table-box
    ref="table"
    :search-config="searchConfig"
    :table-columns="tableColumns"
    :download="downloadConfig"
    service-url="listInventoryRecord">
  </simple-table-box>
</template>

<script>
  import paperWarehouseService from '../../api/service/paperWarehouse';
  import SimpleTableBox from './components/SimpleTableBox';
  import dayjs from 'dayjs';
  export default {
    name: 'paperHistoryStockRecordTable',
    components: {SimpleTableBox},
    data() {
      return {
        searchConfig: [
          {label: '库存时间', key: 'endTime', type: 'date',
            attrs: {
              clearable: false,
              type: 'datetime',
              default: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              beforeChange: (val)=>{
                return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
              },
            }
          },
          {label: '原纸代码', key: 'paperCode', type: 'input', reg: /^\w+$/g},
          {label: '门幅', key: 'paperSize', type: 'input'},
          {label: '原纸供应商', key: 'supplierName', type: 'input'},
          {label: '纸筒编号', key: 'paperTubeNumber', type: 'input'},
          {label: '仓库', type: 'select', key: 'warehouseId', attrs: {
              keyMap: {
                label: 'name',
                value: 'warehouseId'
              },
              options: [],
            }}
        ],
        tableColumns: [
          {label: '入库时间', prop: 'createTime', width: 180, sortable: true,
            formatter(row, index, cur) {
              return dayjs(cur).format('YYYY-MM-DD HH:mm:ss');
            }},
          {label: '原纸供应商', prop: 'supplierName', width: 140, sortable: true,
            sortMethod: (a, b)=>this.sort(a, b, 'supplierName')},
          {label: '纸筒编号', prop: 'paperTubeNumber', width: 160, sortable: true},
          {label: '原纸代码', prop: 'paperCode', width: 140, sortable: true},
          {label: '原纸名称', prop: 'paperName', width: 140, sortable: true,
            sortMethod: (a, b)=>this.sort(a, b, 'paperName'),
            formatter: (row, index, cur) => {
              let obj = this.$enum.paperType._swap[row.paperType] || {};
              return obj.label + row.paperCode || '';
            }
          },
          {label: '克重（g）', prop: 'gram', width: 140, sortable: true},
          {label: '门幅（mm）', prop: 'paperSize', width: 140, sortable: true},
          {label: '重量（Kg）', prop: 'weight', width: 140, sortable: true},
          {label: '破损重量（Kg）', prop: 'damagedWeight', width: 160, sortable: true},
          {label: '净重（Kg）', prop: 'suttle', width: 140, sortable: true},
          {label: '单价', prop: 'unitPrice', width: 140, sortable: true},
          {label: '金额', prop: 'amount', width: 140, sortable: true},
          {label: '折扣金额', prop: 'discount', width: 140, sortable: true},
          {label: '长度（m）', prop: 'length', width: 140, sortable: true},
          {label: '仓库', prop: 'warehouseName', width: 140, sortable: true,
            sortMethod: (a, b)=>this.sort(a, b, 'warehouseName')},
          {label: '库区', prop: 'warehouseAreaName', width: 140, sortable: true,
            sortMethod: (a, b)=>this.sort(a, b, 'warehouseAreaName')},
          {label: '入库类型', prop: 'storageType', width: 140, sortable: true,
            sortMethod: (a, b)=>this.sort(a, b, 'storageType')},
        ],
        downloadConfig: {
          url: 'printInventoryRecord',
          filename: '原纸历史库存记录表'
        },
        totalQuantity: 0,
        totalQuality: 0,
        auth: false
      };
    },
    methods: {
      sort(a, b, prop) {
        if (a[prop] && b[prop]) {
          return a[prop].localeCompare(b[prop]);
        }
      },
      getWarehouse() {
        return this.dj_api_extend(paperWarehouseService.getPaperWarehouse).then((res) => {
          this.searchConfig[5].attrs.options = res.list || [];
        });
      }
    },
    mounted() {
      this.getWarehouse();
    },
    created() {
      paperWarehouseService.judgeAmountAuth().then(res=>{
        if (!res) {
          this.tableColumns.splice(10, 3);
        }
      });
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .ext-data {
    display: flex;
  }
</style>
