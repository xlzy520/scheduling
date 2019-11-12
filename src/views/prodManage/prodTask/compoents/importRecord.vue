<template>
  <dj-dialog title="汇入记录" ref="dialog" @close="close" :has-footer="false">
    <div class="content">
      <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
      <dj-table
          ref="table"
          :data="tableData"
          is-cache-columns
          :cache-columns-name="`${$store.getters.uids}-${$route.name}-importRecord`"
          :columns="tableColumns"
          :column-type="['index']"
          :total="pageTotal"
          :height="height"
          :loading="loading"
          @update-data="getTableData"
      >
        <div slot="btn">
          <el-button type="primary" @click="exportRecord" :loading="isExporting">导出记录</el-button>
        </div>
      </dj-table>
    </div>
  </dj-dialog>
</template>

<script>
  import dayjs from 'dayjs';
  import prodTaskService from '../../../../api/service/prodTask';
  import productionLine from "../../../../api/service/productionLine";
  import {orderKeys} from "../../../../utils/system/constant/dataKeys";

  export default {
    name: 'importRecord',
    data() {
      return {
        searchConfig: [
          {
            // 默认近三天
            label: '汇入日期', key: 'timeRange', type: 'date', attrs: {
              default: this.$method.getDateRange('daterange', 4, 'day'),
              // default: [dayjs().subtract(3, 'day').format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
              type: 'daterange',
              clearable: false,
              pickerOptions: {
                shortcuts: [
                  {
                    text: '近7天',
                    onClick(picker) {
                      picker.$emit('pick', picker.$method.getDateRange('daterange', 7, 'day'));
                    }
                  },
                  {
                    text: '近30天',
                    onClick(picker) {
                      picker.$emit('pick', picker.$method.getDateRange('daterange', 30, 'day'));
                    }
                  },
                  {
                    text: '近三月',
                    onClick(picker) {
                      picker.$emit('pick', picker.$method.getDateRange('daterange', 3, 'month'));
                    }
                  }
                ]
              },
              beforeChange: this.$method.getLimitTime
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
          {label: '排序', prop: 'listNumber', width: 160},
          {label: '生产编号', prop: orderKeys.productionNo, width: 160},
          {label: '汇入日期', prop: orderKeys.affluxTime, width: 180},
          {label: '操作人', prop: orderKeys.operator},
          {label: '生产线', prop: 'line', formatter: row => row.lineNum + '号线'},
          {label: '楞型', prop: 'fluteTypeAndLayers'},
          {label: '用料代码', prop: orderKeys.materialCode},
          {label: '贴合面纸', prop: orderKeys.topSheet},
          {label: '1车芯纸', prop: orderKeys.corePaper1},
          {label: '1车面纸', prop: orderKeys.facePaper1},
          {label: '2车芯纸', prop: orderKeys.corePaper2},
          {label: '2车面纸', prop: orderKeys.facePaper2},
          {label: '3车芯纸', prop: orderKeys.corePaper3},
          {label: '3车面纸', prop: orderKeys.facePaper3},
          {label: '门幅', prop: 'paperSize'},
          {label: '订单米数', prop: 'orderMeter'},
          {label: '订单数量', prop: orderKeys.orderAmount},
          {label: '生产数量', prop: orderKeys.productAmount},
          {label: '下料规格(cm)', prop: orderKeys.materialSize, width: 120},
          {label: '压线方式', prop: orderKeys.linePressingMethod},
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
          {label: '客户名称', prop: orderKeys.customerName},
          {label: '打包数量', prop: 'packCount'},
        ],
        pageTotal: 0,
        searchVisible: false,
        isExporting: false,
        height: '537px'
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
          lineId: lineId,
          affluxTimeStart: timeRange[0],
          affluxTimeEnd: timeRange[1],
        };
        this.searchData = params;
        this.$refs.table.changePage(1);
      },
      getTableData(data) {
        this.loading = true;
        this.dj_api_extend(prodTaskService.list, {
          ...data,
          search: this.searchData
        }).then(res => {
          const {list, total} = res;
          // 拆解vformula，赋值压线1-7
          list.map(row => {
            if (row[orderKeys.longitudinalPressure]) {
              const formulaList = row[orderKeys.longitudinalPressure].split('+') || [];
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
        this.isExporting = true;
        this.dj_api_extend(prodTaskService.exportExcel, {search: this.searchData}).then(res => {
          this.$method.downloadExecl(res, `汇入生管记录`);
        }).finally(() => {
          this.isExporting = false;
        });
      },
      close() {
        this.formData = {};
        this.$emit('close');
      },
      open() {
        this.$refs.dialog.open();
        this.getAllLine();
        this.$nextTick(() => {
          this.$refs.table.filteredColumn.splice(0, 1);// 初始隐藏排序选择
          this.$refs.search.search();
        });
      },
      heightCompute() {
        const windowWidth = window.innerWidth;
        const maxHeight = windowWidth < 1920 ? windowWidth > 1600 ? 669 : 549 : 812;
        const dialog__header = 56;
        const paddingTop = 16;
        const search = 145;
        const overTable = 38;
        const footer = 20;
        const res = maxHeight - dialog__header - paddingTop - search - overTable - footer;
        this.height = res + 'px';
      }
    },
    mounted() {
      window.addEventListener('resize', ()=>{
        this.heightCompute();
      });
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.heightCompute());
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .content {
    position: relative;
    width: 1140px;
    /*height: 700px;*/
    @media screen and (max-width: 1400px){
      .content{
        /*height: 400px;*/
      }
    }
  }
</style>
