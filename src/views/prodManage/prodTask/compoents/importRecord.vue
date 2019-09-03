<template>
  <dj-dialog title="汇入记录" ref="dialog" @close="close" :hasFooter="false">
    <div class="content">
      <single-page v-loading="loading">
        <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
        <page-pane>
          <dj-table
            ref="table"
            :data="tableData"
            :columns="tableColumns"
            :column-type="['index']"
            :total="pageTotal"
            height="100%"
            @update-data="getTableData"
          >
            <div slot="btn">
              <el-button type="primary" @click="exportRecord">导出记录</el-button>
            </div>
          </dj-table>
        </page-pane>
      </single-page>
    </div>
  </dj-dialog>
</template>

<script>
  import dayjs from 'dayjs';
  import prodTaskService from '../../../../api/service/prodTask';
  import productionLine from "../../../../api/service/productionLine";
export default {
  name: 'importRecord',
  data() {
    return {
      searchConfig: [
        {
          // 默认近三天
          label: '汇入日期', key: 'timeRange', type: 'date', attrs: {
            default: [dayjs(new Date()).subtract(3, 'day').format('YYYY-MM-DD'), dayjs(new Date()).format('YYYY-MM-DD')],
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
            type: 'daterange',
            pickerOptions: {
              shortcuts: [
                {
                  text: '近7天',
                  onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                  }
                },
                {
                  text: '近30天',
                  onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                  }
                },
                {
                  text: '近三个月',
                  onClick(picker) {
                    const end = new Date();
                    picker.$emit('pick', [dayjs().subtract(92, 'day').toDate(), end]);
                  }
                }
              ]
            },
            valueFormat: "yyyy-MM-dd"
          }
        },
        {
          label: '生产线',
          type: 'select',
          key: 'id',
          attrs: {
            options: [],
            keyMap: {
              value: 'id',
              label: 'label'
            },
          },
          listeners: {
            'visible-change': (val)=>{
              if (val) {
                this.getAllLine();
              }
            }
          }
        },
      ],
      formData: {},
      loading: false,
      searchData: {},
      tableData: [],
      tableColumns: [
        {label: '生产编号', prop: 'produceOrderNumber', width: 200},
        {label: '汇入日期', prop: 'importDate', width: 180},
        {label: '操作人', prop: 'man'},
        {label: '生产线', prop: 'line'},
        {label: '楞型', prop: 'tilemodel'},
        {label: '用料代码', prop: 'code'},
        {label: '贴合面纸', prop: 'cut'},
        {label: 'B车芯纸', prop: 'cutWidth'},
        {label: 'B车面纸', prop: 'wasteSize'},
        {label: 'C车芯纸', prop: 'stavetype'},
      ],
      pageTotal: 0,
    };
  },
  methods: {
    getAllLine() {
      this.dj_api_extend(productionLine.showAllLine, {pageNo: 1, pageSize: 9999999}).then(res=>{
        this.searchConfig[1].attrs.options = (res.list || []).map(obj=>{
          obj.label = obj['lineNum'] + '号线';
          return obj;
        });
      });
    },
    search(query) {
      const {timeRange, line} = query;
      let params = {
        ...line,
        startTime: timeRange[0],
        endTime: timeRange[1],
      };
      this.searchData = params;
      this.$refs.table.changePage(1);
    },
    getTableData(data) {
      // this.loading = true;
      let mock = {};
      this.tableColumns.map(v=>v.prop).map((prop, index)=>{
        if (index === 0) {
          mock[prop] = 'CGRN201905142345423';
        } else if (index === 1) {
          mock[prop] = '2019-07-18 15:21:32';
        } else {
          mock[prop] = 'A434C';
        }
      });
      this.tableData = new Array(6).fill(mock);
      console.log(this.tableData);
      // this.dj_api_extend(prodTaskService.importRecord, {
      //   ...data,
      //   ...this.searchData
      // }).then(res => {
      //   const {list, total} = res.data.data;
      //   this.tableData = list;
      //   this.pageTotal = total;
      // }).finally(() => {
      //   this.loading = false;
      // });
    },
    exportRecord () {
      this.loading = true;
      this.dj_api_extend(prodTaskService.exportRecord, this.searchData).then(res=>{
        this.$method.fileDownload(res, `汇入记录 ${dayjs().format('YYYYMMDD')}.xlsx`);
      }).finally(()=>{
        this.loading = false;
      });
    },
    close () {
      this.formData = {};
      this.$emit('close');
    },
    open() {
      this.$refs.dialog.open();
      console.log(this.$refs);
      this.$nextTick(() => {
        this.$refs.search.search()
      })

    },
  },
  mounted() {

  }
};
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .content{
    width: 1140px;
    height: 792px;
  }
</style>
