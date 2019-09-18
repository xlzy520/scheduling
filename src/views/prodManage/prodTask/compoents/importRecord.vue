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
  const mockData = {
    "msg": "请求成功！",
    "code": "10001200",
    "data": {
      "total": 1,
      "list": [
        {
          "rowId": "1",
          "id": "0077e165-d912-11e9-8856-0619ea000039",
          "operatorId": "958",
          "operator": "东经科技",
          "createTime": 1568702038000,
          "updateTime": 1568707252000,
          "taskNumber": "T0001",
          "produceOrderNumber": "B190916002101",
          "associatedOrders": "P1911200001",
          "productName": "A437J",
          "orderFlag": 1,
          "productLength": 50,
          "productWidth": 50,
          "productHeight": 59,
          "customerId": "217f0a93-801f-11e6-a85c-00163f0045ca",
          "customerName": "杜锡龙",
          "hformula": "3.5+38.5+26.5+38.5+26.5",
          "affluxTime": 1568736000000,
          "arriveTime": 1568736000000,
          "staveType": "普通压线",
          "isDeleted": 0,
          "remark": null,
          "linkMan": "",
          "linkAddress": "",
          "orderType": 1,
          "lineId": "c373e5c0-4931-4339-9b7a-3e71f472013d",
          "lineNum": "1",
          "slimachKnifeCount": 20,
          "materialId": "xxx",
          "materialCode": "A437J",
          "layer": 5,
          "tileModel": "BC",
          "topSheet": "1",
          "corePaper1": "B",
          "facePaper1": "B",
          "corePaper2": "B",
          "facePaper2": "B",
          "corePaper3": "B",
          "facePaper3": "B",
          "materialGram": 23,
          "sort": 1,
          "stackFlag": 1,
          "packCount": 20,
          "orderAmount": 500,
          "produceAmount": 80,
          "materialLength": 117.5,
          "orderMeter": 20,
          "cutCount": 30,
          "knifeCount": 3,
          "vformula": "25+25",
          "sourceVformula": "25+25",
          "paperSize": 1700,
          "sourcePaperSize": 1600,
          "materialWidth": 88,
          "sourceMaterialWidth": 51,
          "trimming": 23,
          "sourceTrimming": 23,
          "trimmingRate": 0.02,
          "sourceTrimmingRate": 0.02
        }
      ]
    },
    "success": true
  };
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
              default: [dayjs().subtract(3, 'day').format('YYYY-MM-DD'), dayjs().add(40, 'day').format('YYYY-MM-DD')],
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
          {label: '订单数量', prop: 'orderAmount'},
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
            if (res.list.length > 0) {
              this.searchConfig[1].attrs.default = res.list[0].id;
            }
            resolve();
          });
        });
      },
      search(query) {
        const {timeRange, lineId} = query;
        let params = {
          'search[lineId]': lineId,
          'search[affluxTimeStart]': timeRange[0],
          'search[affluxTimeEnd]': timeRange[1],
          'search[isDeleted]': 0,
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
          // const {list, total} = res;
          const {list, total} = mockData.data;
          // 拆解vformula，赋值压线1-7
          list.map(row=>{
            const formulaList = row.vformula.split('+') || [];
            formulaList.map((v, index) => {
              row['stave' + (index + 1)] = v;
            });
          });
          this.tableData = list;
          this.pageTotal = total;
        }).finally(() => {
          this.loading = false;
        });
      },
      exportRecord() {
        let paramsStr = `search[materialLengthStart]=${this.searchData}`;
        for (const item in this.searchData) {
          paramsStr += item + '=' + this.searchData[item] + '&';
        }
        this.$method.fileDownload('/djsupplier/produceTask/exportExcel.do?' + paramsStr);
      },
      close() {
        this.formData = {};
        this.$emit('close');
      },
      open() {
        this.$refs.dialog.open();
        this.getAllLine().then(() => {
          this.searchVisible = true;
          this.$nextTick(() => {
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
  .content {
    width: 1140px;
    height: 700px;
  }
</style>
