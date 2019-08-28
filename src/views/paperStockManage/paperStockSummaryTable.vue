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
          {label: '选择日期：', key: 'timeRange', type: 'date', attrs: {
              clearable: false, type: 'daterange', valueFormat: "yyyy-MM-dd",
              default: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
              pickerOptions: {
                shortcuts: [
                  {text: '今天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      picker.$emit('pick', [start, end]);
                    }},
                  {text: '近7天',
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
              beforeChange: (val) => {
                let _val = val;
                if (val[0] && val[1]) {
                  let day92 = dayjs(val[0]).add(92, 'day');
                  if (day92.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], day92.toDate()];
                  }
                }
                return _val;
              },
              }},
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
    },
    mounted() {
      this.$refs.table.getTableData();
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
