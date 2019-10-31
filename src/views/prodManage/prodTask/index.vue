<template>
  <single-page class="table-page prod-task">
    <el-tabs v-model="activeTab" @tab-click="tabClick">
      <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.lineNum+'号线'" :name="tab.id"></el-tab-pane>
    </el-tabs>
    <div class="content" v-loading="contentLoading">
      <single-page>
        <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
        <page-pane>
          <dj-table
              ref="table"
              :data="tableData"
              scroll-load
              :columns="tableColumns"
              :column-type="['selection', 'index']"
              @selection-change="selectionChange"
              :total="pageTotal"
              height="100%"
              :loading="loading"
              @update-data="getTableData"
              :default-page-size="100"
              :page-size-list="[100,200]"
          >
            <div slot="btn">
              <el-button type="primary" @click="removeOrder" :loading="removeLoading">移除订单</el-button>
              <!--<el-button type="primary" @click="adjustSort">调整排序</el-button>-->
              <el-button type="primary" @click="printQRCode">打印二维码</el-button>
              <el-button type="primary" @click="printAll" :loading="printLoading">打印全部</el-button>
              <el-button type="primary" @click="ViewImportRecord">查看汇入记录</el-button>
            </div>
          </dj-table>
        </page-pane>
        <adjust-sort ref="view" v-if="visibleType==='adjustSort'" @close="close" @confirm="search"></adjust-sort>
        <prod-task-view ref="view" v-if="visibleType==='view'" @close="close"></prod-task-view>
        <import-record ref="view" v-if="visibleType==='record'" @close="close"></import-record>
      </single-page>
    </div>
    <order-tag ref="printTag" :data="printAllList" :ext-order-keys="extOrderKeys"></order-tag>
  </single-page>

</template>

<script>
  import prodTaskService from '../../../api/service/prodTask';
  import productionLineService from '../../../api/service/productionLine';
  import AdjustSort from "./compoents/adjustSort";
  import ProdTaskView from "./compoents/prodTaskView";
  import ImportRecord from "./compoents/importRecord";
  import materialSizeInput from "../../../components/materialSizeInput";
  import paperSizeRange from "../../../components/paperSizeRange";
  import orderTag from '../../../components/printTag/orderTag';

  export default {
    name: 'ProdTask',
    components: {ImportRecord, ProdTaskView, AdjustSort, orderTag, materialSizeInput, paperSizeRange},
    data() {
      return {
        activeTab: '',
        tabs: [],
        printLoading: false,
        searchConfig: [
          {
            // 默认近三天
            label: '汇入日期', key: 'timeRange', type: 'date', attrs: {
              type: 'daterange',
              clearable: false,
              default: this.$method.getDateRange('daterange', 4, 'day'),
              // default: [dayjs().subtract(3, 'day').format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
              beforeChange: this.$method.getLimitTime
            }
          },
          {label: '生产编号', key: 'produceOrderNumber', type: 'input', attrs: {reg: /^\w*$/}},
          {
            label: '下料规格', key: 'guige', type: 'custom',
            component: materialSizeInput
          },
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '客户名称', key: 'customerName', type: 'input'},
          {
            label: '门幅范围', key: 'paperSize', type: 'custom',
            component: paperSizeRange,
            attrs: {
              default: [],
              reg: /^\d*$/
            }
          },
        ],
        tableData: [],
        tableColumns: [
          {label: '排序', prop: 'listNumber', width: 160},
          {label: '生产编号', prop: 'produceOrderNumber', width: 160},
          {label: '客户名称', prop: 'customerName'},
          {label: '产品名称', prop: 'grouponProductName'},
          {label: '用料代码', prop: 'materialCode'},
          {label: '瓦楞楞型', prop: 'tileModel', formatter: row => row.layer + row.tileModel},
          {label: '门幅宽度', prop: 'paperSize'},
          {label: '订单米数', prop: 'orderMeter'},
          {
            label: '下料规格(cm)', prop: 'xialiaoguige', width: 120,
            formatter: row => row.materialLength + '*' + row.materialWidth
          },
          {label: '切数', prop: 'cutCount', width: 120},
          {label: '切宽', prop: 'materialWidth', width: 120},
          {label: '修边', prop: 'trimming'},
          {label: '压线方式', prop: 'staveType'},
          {label: '压线公式', prop: 'vformula', width: 120},
          {label: '叠单', prop: 'stackFlag', formatter: row => row.stackFlag === 0 ? '' : row.stackFlag},
          {
            label: '操作', prop: 'operation', fixed: 'right',
            render: (h, {props: {row}}) => {
              return (
                <div class="td-btn-group">
                  <a onClick={() => this.view(row)}>查看</a>
                </div>
              );
            },
          },
        ],
        pageTotal: 0,
        searchData: {},
        loading: false,
        checkedList: [],
        visibleType: '',
        printAllList: [],
        extOrderKeys: {
          consignee: 'linkMan',
          packageAmount: 'packCount',
          layer: 'layer',
          address: 'addressArea',
        },
        contentLoading: false,
        timeRange: [],
        removeLoading: false
      };
    },
    methods: {
      tabClick() {
        this.$refs.search.search();
      },
      adjustSort() {
        this.visibleType = 'adjustSort';
        this.$nextTick(() => {
          this.$refs.view.open();
        });
      },
      printQRCode() {
        const {length} = this.checkedList;
        if (length === 0) {
          this.$message('请选择订单', 'error');
          return false;
        }
        this.printAllList = this.checkedList;
        this.$nextTick(() => {
          this.$refs.printTag.print();
        });
      },
      printAll() {
        this.printLoading = true;
        this.dj_api_extend(prodTaskService.list, {
          search: this.searchData,
          pageNo: 1,
          pageSize: 999999,
        }).then(res => {
          const {list, total} = res;
          if (total === 0) {
            this.$message('无可打印数据', 'error');
            return false;
          } else {
            this.printAllList = list.slice(0, 20);
            this.$nextTick(() => {
              this.$refs.printTag.print();
            });
          }
        }).finally(() => {
          this.printLoading = false;
        });
      },
      ViewImportRecord() {
        this.visibleType = 'record';
        this.$nextTick(() => {
          this.$refs.view.open();
          this.$refs.view.searchConfig[1].attrs.default = this.activeTab;
          this.$refs.view.searchConfig[0].attrs.default = this.timeRange;
        });
      },
      view(row) {
        this.visibleType = 'view';
        this.$nextTick(() => {
          this.$refs.view.open(row.produceOrderNumber);
          this.$refs.view.formData = row;
        });
      },
      close() {
        this.visibleType = '';
      },
      removeOrder() {
        if (this.checkedList.length === 0) {
          this.$message('请选择订单', 'error');
          return false;
        } else {
          this.$method.tipBox(`请先将所选订单从生管系统移除，再从生产任务页面移除订单`, () => {
            this.removeLoading = true;
            const idList = this.checkedList.map(v => v.produceOrderNumber);
            return this.dj_api_extend(prodTaskService.removeOrder, {
              produceOrderNumbers: idList,
              lineId: this.activeTab
            }).then(() => {
              this.$message('移除成功', 'success');
            }).finally(() => {
              this.removeLoading = false;
              setTimeout(() => {
                this.$refs.search.search();
              }, 500);
            });
          });
          // this.$confirm('请先将所选订单从生管系统移除，再从生产任务页面移除订单', '', {
          //   type: 'warning',
          //   showClose: false,
          // }).then(() => {
          //   this.removeLoading = true;
          //   const idList = this.checkedList.map(v=> v.produceOrderNumber);
          //   this.dj_api_extend(prodTaskService.removeOrder, {
          //     produceOrderNumbers: idList
          //   }).then(() => {
          //     this.$message('移除成功', 'success');
          //   }).finally(() => {
          //     this.removeLoading = false;
          //     setTimeout(()=>{
          //       this.$refs.search.search();
          //     }, 500);
          //   });
          // });

        }
      },
      selectionChange(checkedList) {
        this.checkedList = checkedList;
      },
      search(query) {
        const {timeRange, guige, paperSize, ...restQuery} = query;
        this.timeRange = timeRange;
        let params = {
          affluxTimeStart: timeRange[0],
          affluxTimeEnd: timeRange[1],
          isDeleted: 0,
          ...restQuery,
          lineId: this.activeTab,

        };
        if (guige !== undefined) {
          let guigeParams = {
            materialLength: guige[0],
            materialWidth: guige[1],
          };
          Object.assign(params, guigeParams);
        }
        if (paperSize !== undefined && paperSize.some(v => v)) {
          let paperSizeParams = {
            paperSizeStart: Math.min.apply(null, paperSize),
            paperSizeEnd: Math.max.apply(null, paperSize),
          };
          Object.assign(params, paperSizeParams);
        }
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
          this.tableData = list;
          this.pageTotal = total;
          this.checkedList = [];
        }).finally(() => {
          this.loading = false;
        });
      },
      getLineData() {
        this.dj_api_extend(productionLineService.showAllLine).then(res => {
          this.tabs = res.list;
          if (res && res.list[0]) {
            this.activeTab = res.list[0].id;
            this.tabClick();
          }
        });
      }
    },
    mounted() {
      this.getLineData();
      this.$nextTick(() => {
        // 初始隐藏排序选择
        this.$refs.table.filteredColumn.splice(0, 1);
      });
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .prod-task {
    display: flex;
    flex-direction: column;

    .content {
      flex: 1 1;
      position: relative;
    }
  }

  .el-tabs {
    /*margin: 0 18px;*/
  }

  @{deep} .el-tabs__nav-wrap {
    /*width: 70%;*/

    .el-tabs__nav.is-stretch {
      /*min-width: 80%;*/
    }

    .el-tabs__item {
      /*font-size: 16px;*/
      /*max-width: 180px;*/
    }
  }

  @{deep} .xialiaoguige {
    display: flex;

    .text {
      margin: auto 5px;
    }
  }

  @{deep} .operation {
    line-height: 1;

    a {
      padding: 2px 10px;
      color: #3654ea;
      cursor: pointer;
    }

    .divideState-completed {
      color: #909399;
      pointer-events: none;
    }
  }

  .dialog {
    width: 1100px;

    .order-info-text {
      width: 105px;
      padding: 15px 8px 15px 0;
      font-family: PingFang SC Medium, sans-serif;
      font-weight: 500;
      color: rgba(48, 49, 51, 1);
      text-align: right;
    }
  }

</style>
