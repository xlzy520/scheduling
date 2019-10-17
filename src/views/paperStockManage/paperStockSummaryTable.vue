<template>
  <simple-table-box
    ref="table"
    :search-config="searchConfig"
    :table-columns="tableColumns"
    :download="downloadConfig"
    service-url="listSummary"></simple-table-box>
</template>

<script>
  import SimpleTableBox from './components/SimpleTableBox';
  import dayjs from 'dayjs';
  export default {
    name: 'paperStockSummaryTable',
    components: {SimpleTableBox},
    data() {
      return {
        searchConfig: [
          {label: '选择日期', key: 'timeRange', type: 'date',
            attrs: {
              clearable: false,
              type: 'daterange',
              default: this.$method.getDateRange('daterange', 1),
              // default: [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')],
              beforeChange: this.$method.getLimitTime,
            }
            },
          {label: '原纸代码', key: 'paperCode', type: 'input', reg: /^\w+$/g},
          {label: '门幅', key: 'paperSize', type: 'input'},
          {label: '原纸供应商', key: 'supplierName', type: 'input'},
        ],
        tableColumns: [
          {label: '原纸供应商', prop: 'supplierName'},
          {label: '原纸代码', prop: 'paperCode'},
          {label: '门幅(mm)', prop: 'paperSize'},
          {label: '入库件数', prop: 'inNum',
            render: (h, {props: {row, col}}) => {
              return (<span class="blue">{row[col.prop]}</span>);
            }
          },
          {label: '入库重量(Kg)', prop: 'inWeight',
            render: (h, {props: {row, col}}) => {
              return (<span class="blue">{row[col.prop]}</span>);
            }},
          {label: '入库长度(m)', prop: 'inLength',
            render: (h, {props: {row, col}}) => {
              return (<span class="blue">{row[col.prop]}</span>);
            }},
          {label: '入库面积(㎡)', prop: 'inArea',
            render: (h, {props: {row, col}}) => {
              return (<span class="blue">{row[col.prop]}</span>);
            }},
          {label: '出库件数', prop: 'outNum',
            render: (h, {props: {row, col}}) => {
              return (<span class="gress">{row[col.prop]}</span>);
            }},
          {label: '出库重量(Kg)', prop: 'outWeight',
            render: (h, {props: {row, col}}) => {
              return (<span class="gress">{row[col.prop]}</span>);
            }},
          {label: '出库长度(m)', prop: 'outLength',
            render: (h, {props: {row, col}}) => {
              return (<span class="gress">{row[col.prop]}</span>);
            }},
          {label: '出库面积(㎡)', prop: 'outArea',
            render: (h, {props: {row, col}}) => {
              return (<span class="gress">{row[col.prop]}</span>);
            }},
        ],
        downloadConfig: {
          url: 'printSummary',
          filename: '原纸出入库汇总表'
        }
      };
    }
  };
</script>

<style lang="less" scoped>
/deep/ .gress {
  color: #40b317;
}
/deep/ .blue {
  color: #3654ea;
}
</style>
