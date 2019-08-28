<template>
  <simple-table-box
    ref="table"
    :search-config="searchConfig"
    :table-columns="tableColumns"
    :download="downloadConfig"
    serviceUrl="listSummary"></simple-table-box>
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
          {label: '选择日期：', key: 'timeRange', type: 'date',
            attrs: {
              clearable: false,
              type: 'daterange',
              default: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
              beforeChange: (val) => {
                let _val = val ? [...val] : [];
                if (val[0] && val[1]) {
                  let towMonth = dayjs(val[0]).add(92, 'day');
                  if (towMonth.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], dayjs(towMonth).toDate()];
                  }
                  val[0] = dayjs(val[0]).format('YYYY-MM-DD');
                  val[1] = dayjs(val[1]).format('YYYY-MM-DD');
                }
                return _val;
              },
            }
            },
          {label: '原纸代码：', key: 'paperCode', type: 'input', reg: /^\w+$/g},
          {label: '门幅：', key: 'paperSize', type: 'input', attrs: {type: 'number'}},
          {label: '原纸供应商：', key: 'supplierName', type: 'input'},
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
  color: #40B317;
}
/deep/ .blue {
  color: #3654EA;
}
</style>
