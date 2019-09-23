<template>
  <dj-dialog title="汇入记录" ref="dialog" @close="close" :hasFooter="false">
    <div class="content">
      <single-page>
        <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
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
  function getRange(type, startNum, startUnit = 'day', endNum = 0, endUnit = 'day') {
    let end = new Date(dayjs().add(endNum + 1, endUnit).format('YYYY-MM-DD'));
    let start = new Date(dayjs(end).subtract(startNum + endNum, startUnit).valueOf());
    if (type === 'daterange') {
      end = dayjs(end).subtract(1, 'day');
    }
    return [start, end];
  }

  export default {
    name: 'importRecord',
    data() {
      return {
        searchConfig: [
          {
            // 默认近三天
            label: '汇入日期', key: 'timeRange', type: 'date', attrs: {
              default: [dayjs().subtract(3, 'day').format('YYYY-MM-DD 00:00:00'),
                dayjs().format('YYYY-MM-DD 23:59:59')],
              type: 'daterange',
              clearable: false,
              pickerOptions: {
                shortcuts: [
                  {
                    text: '近7天',
                    onClick(picker) {
                      picker.$emit('pick', getRange('daterange', 7, 'day'));
                    }
                  },
                  {
                    text: '近30天',
                    onClick(picker) {
                      picker.$emit('pick', getRange('daterange', 30, 'day'));
                    }
                  },
                  {
                    text: '近三月',
                    onClick(picker) {
                      picker.$emit('pick', getRange('daterange', 3, 'month'));
                    }
                  }
                ]
              },
              beforeChange: (val) => {
                let _val = val ? [...val] : [];
                if (val[0] && val[1]) {
                  let towMonth = dayjs(val[0]).add(92, 'day');
                  if (towMonth.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], dayjs(towMonth).toDate()];
                  }
                  _val[0] = dayjs(_val[0]).format('YYYY-MM-DD 00:00:00');
                  _val[1] = dayjs(_val[1]).format('YYYY-MM-DD 23:59:59');
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
              'visible-change': (val) => {
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
          {label: '生产编号', prop: 'produceOrderNumber', width: 160},
          {
            label: '汇入日期', prop: 'affluxTime', width: 180,
            formatter: row => this.$method.timeFormat(row.affluxTime, 'yyyy-MM-dd')
          },
          {label: '操作人', prop: 'operator'},
          {label: '生产线', prop: 'line', formatter: row => row.lineNum + '号线'},
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
          {label: '订单数量', prop: 'pieceAmount'},
          {label: '生产数量', prop: 'produceAmount'},
          {
            label: '下料规格(cm)', prop: 'xialiaoguige', width: 120,
            formatter: row => row.materialLength + '*' + row.materialWidth
          },
          {label: '压线方式', prop: 'staveType'},
          {label: '压线1', prop: 'stave1'},
          {label: '压线2', prop: 'stave2'},
          {label: '压线3', prop: 'stave3'},
          {label: '压线4', prop: 'stave4'},
          {label: '压线5', prop: 'stave5'},
          {label: '压线6', prop: 'stave6'},
          {label: '压线7', prop: 'stave7'},
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
        return new Promise(resolve => {
          this.dj_api_extend(productionLine.showAllLine, {pageNo: 1, pageSize: 9999999}).then(res => {
            this.searchConfig[1].attrs.options = (res.list || []).map(obj => {
              obj.label = obj['lineNum'] + '号线';
              return obj;
            });
            resolve();
          });
        });
      },
      search(query) {
        const {timeRange, lineId} = query;
        let params = {
          'search[lineId]': lineId,
          // 'search[lineId]': 'c373e5c0-4931-4339-9b7a-3e71f472013d',
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
          // 拆解vformula，赋值压线1-7
          list.map(row=>{
            if (row.vformula) {
              const formulaList = row.vformula.split('+') || [];
              formulaList.map((v, index) => {
                row['stave' + (index + 1)] = v;
              });
            }
          });
          this.tableData = list;
          this.pageTotal = total;
        }).finally(() => {
          this.loading = false;
        });
      },
      exportRecord() {
        // let paramsStr = `search[materialLengthStart]=${this.searchData}`;
        let paramsStr = ``;
        for (const item in this.searchData) {
          paramsStr += item + '=' + this.searchData[item] + '&';
        }
        const url = '/djsupplier/produceTask/exportExcel.do?' + paramsStr;
        this.$method.fileDownload(url);
      },
      close() {
        this.formData = {};
        this.$emit('close');
      },
      open() {
        this.$refs.dialog.open();
        this.getAllLine();
        this.$nextTick(() => {
          this.$refs.search.search();
        });
      },
    },
    mounted() {

    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .content {
    width: 1140px;
    height: 700px;
  }
</style>
