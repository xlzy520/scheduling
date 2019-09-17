<template>
  <dj-dialog title="汇入记录" ref="dialog" @close="close" :hasFooter="false">
    <div class="content">
      <single-page>
        <dj-search ref="search" :config="searchConfig" @search="search" v-if="searchVisible"></dj-search>
        <page-pane>
          <dj-table
            ref="table"
            :data="tableData"
            :columns="tableColumns"
            :column-type="['index']"
            :total="pageTotal"
            height="100%"
            :loading="loading"
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
            default: [dayjs().subtract(3, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
            type: 'daterange',
            clearable: false,
            beforeChange: (val) => {
              let _val = val ? [...val] : [];
              if (val[0] && val[1]) {
                let towMonth = dayjs(val[0]).add(92, 'day');
                if (towMonth.isBefore(dayjs(val[1]))) {
                  this.$message('时间不能超过92天', 'error');
                  _val = [val[0], dayjs(towMonth).toDate()];
                }
                _val[0] = dayjs(_val[0]).format('YYYY-MM-DD');
                _val[1] = dayjs(_val[1]).format('YYYY-MM-DD');
              }
              return _val;
            }
          }
        },
        {
          label: '生产线',
          type: 'select',
          key: 'lineId',
          attrs: {
            options: [],
            default: this.default,
            keyMap: {
              value: 'id',
              label: 'label'
            },
          },
          listeners: {
            'visible-change': (val)=>{
              if (val) {
                // this.getAllLine();
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
        {label: '生产编号', prop: 'grouponOrderNumber', width: 200},
        {label: '汇入日期', prop: 'affluxTime', width: 180},
        {label: '操作人', prop: 'operator'},
        {label: '生产线', prop: 'line', formatter: row=> row.lineNum + '号线'},
        {label: '楞型', prop: 'tileModel'},
        {label: '用料代码', prop: 'materialCode'},
        {label: '贴合面纸', prop: 'topSheet'},
        {label: '1车芯纸', prop: 'corePaper1'},
        {label: '1车面纸', prop: 'facePaper1'},
        {label: '2车芯纸', prop: 'corePaper2'},
        {label: '2车面纸', prop: 'facePaper2'},
        {label: '3车芯纸', prop: 'corePaper3'},
        {label: '3车面纸', prop: 'facePaper3'},
        {label: '门幅', prop: 'paperSize'},
        {label: '订单米数', prop: 'orderMeter'},
        {label: '订单数量', prop: 'orderAmount'},
        {label: '生产数量', prop: 'produceAmount'},
        {label: '下料规格(cm)', prop: 'xialiaoguige', width: 120,
          formatter: row=>row.materialLength + '*' + row.materialWidth},
        {label: '压线方式', prop: 'staveType'},
        {label: '压线1', prop: 'stavetype1'},
        {label: '压线2', prop: 'stavetype2'},
        {label: '压线3', prop: 'stavetype3'},
        {label: '修边', prop: 'trimming'},
        {label: '切数', prop: 'cutCount'},
        {label: '刀数', prop: 'knifeCount'},
        {label: '客户名称', prop: 'customerName'},
        {label: '打包数量', prop: 'packCount'},
      ],
      pageTotal: 0,
      searchVisible: false
    };
  },
  methods: {
    getAllLine() {
      return this.dj_api_extend(productionLine.showAllLine, {pageNo: 1, pageSize: 9999999}).then(res=>{
        this.searchConfig[1].attrs.options = (res.list || []).map(obj=>{
          obj.label = obj['lineNum'] + '号线';
          return obj;
        });
        if (res.list.length > 0) {
          this.searchConfig[1].attrs.default = res.list[0].id;
        }
      });
    },
    search(query) {
      const {timeRange, lineId} = query;
      let params = {
        'search[lineId]': lineId,
        'search[affluxTimeStart]': timeRange[0],
        'search[affluxTimeEnd]': timeRange[1],
      };
      this.searchData = params;
      this.$refs.table.changePage(1);
    },
    getTableData(data) {
      this.loading = true;
      this.dj_api_extend(prodTaskService.list, {
        ...data,
        ...this.searchData
      }).then(res => {
        const {list, total} = res;
        this.tableData = list;
        this.pageTotal = total;
      }).finally(() => {
        this.loading = false;
      });
    },
    exportRecord () {
      let paramsStr = `search[materialLengthStart]=${this.searchData}`;
      for (const item in this.searchData) {
        paramsStr += item + '=' + this.searchData[item] + '&';
      }
      this.$method.fileDownload('/djsupplier/produceTask/exportExcel.do?' + paramsStr);
    },
    close () {
      this.formData = {};
      this.$emit('close');
    },
    open() {
      this.$refs.dialog.open();
      this.$nextTick(() => {
        this.searchVisible = true;
        this.getAllLine().then(()=>{
          this.$refs.search.search();
        });
      });

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
