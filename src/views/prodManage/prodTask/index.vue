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
          {label: '瓦楞楞型', prop: 'tileModel'},
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
          layer: 'layer'
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
          const rs = {
            "total": 6, "list": [{
              "rowId": "4146",
              "id": "87f3d640-f6f2-11e9-9e95-00163e120883",
              "operatorId": "4000001",
              "operator": "吴伟",
              "supplierId": "400",
              "createTime": 1572224831000,
              "updateTime": 1572224831000,
              "taskNumber": "f92e6483-2f68-4a9f-8753-0900f27b3981",
              "produceOrderNumber": "A400201910171371",
              "grouponOrderNumber": "CGRP201908301412347765",
              "grouponProductName": "B=C（美牛）",
              "associatedOrders": "CGRP201908301412347765",
              "productLength": null,
              "productWidth": null,
              "productHeight": null,
              "orderFlag": 0,
              "staveType": "不压线",
              "orderType": 0,
              "customerId": "b614c6c4-77f3-11e6-bc12-00163f004cae",
              "customerName": "陈杰1",
              "hformula": null,
              "affluxTime": 1572224831000,
              "arriveTime": 1567180800000,
              "isDeleted": 0,
              "remark": null,
              "linkMan": "陈杰",
              "linkAddress": "八里南路63号永嘉县桥下镇八里村八里南路87号",
              "lineId": "c373e5c0-4931-4339-9b7a-3e71f472013d",
              "lineNum": "1",
              "slimachKnifeCount": 7,
              "materialId": "bb03f420-2017-4bef-b884-e40803deabde",
              "materialCode": "B434C",
              "layer": 5,
              "tileModel": "BC",
              "topSheet": "B",
              "corePaper1": "4",
              "facePaper1": "3",
              "corePaper2": "4",
              "facePaper2": "C",
              "corePaper3": null,
              "facePaper3": null,
              "materialGram": 531.95,
              "listNumber": "201910280001",
              "stackFlag": 1,
              "packCount": 15,
              "pieceAmount": 200,
              "produceAmount": 200,
              "materialLength": 131.00,
              "orderMeter": 262,
              "cutCount": 1,
              "knifeCount": 200,
              "vformula": null,
              "paperSize": 1900,
              "materialWidth": 184.00,
              "trimming": 60,
              "trimmingRate": 0.0316
            }, {
              "rowId": "4153",
              "id": "5debe378-f92a-11e9-9e95-00163e120883",
              "operatorId": "4000001",
              "operator": "吴伟",
              "supplierId": "400",
              "createTime": 1572229645000,
              "updateTime": 1572229645000,
              "taskNumber": "e4fd4325-ff52-4b7c-8feb-3220cab6f369",
              "produceOrderNumber": "C4001910280012",
              "grouponOrderNumber": "DGRB201910281454439034",
              "grouponProductName": "平台纸板补单",
              "associatedOrders": "DGRB201910281454439034",
              "productLength": 45.00,
              "productWidth": 45.00,
              "productHeight": 45.00,
              "orderFlag": 0,
              "staveType": "普通压线",
              "orderType": 3,
              "customerId": "9f37ac84-25c0-48ff-8a5f-01d6d59394df",
              "customerName": "线下陈薇",
              "hformula": "4.0+45+45+45+45",
              "affluxTime": 1572229645000,
              "arriveTime": 1572228716000,
              "isDeleted": 0,
              "remark": null,
              "linkMan": "11223",
              "linkAddress": "文一西路836",
              "lineId": "c373e5c0-4931-4339-9b7a-3e71f472013d",
              "lineNum": "1",
              "slimachKnifeCount": 7,
              "materialId": "bb03f420-2017-4bef-b884-e40803deabde",
              "materialCode": "B434C",
              "layer": 5,
              "tileModel": "BC",
              "topSheet": "B",
              "corePaper1": "4",
              "facePaper1": "3",
              "corePaper2": "4",
              "facePaper2": "C",
              "corePaper3": null,
              "facePaper3": null,
              "materialGram": 531.95,
              "listNumber": "201910280002",
              "stackFlag": 2,
              "packCount": 25,
              "pieceAmount": 45,
              "produceAmount": 46,
              "materialLength": 184.00,
              "orderMeter": 42,
              "cutCount": 2,
              "knifeCount": 23,
              "vformula": "22.75+45+22.75",
              "paperSize": 1850,
              "materialWidth": 90.50,
              "trimming": 40,
              "trimmingRate": 0.0216
            }, {
              "rowId": "4167",
              "id": "17f06b5d-f92b-11e9-9e95-00163e120883",
              "operatorId": "4000001",
              "operator": "吴伟",
              "supplierId": "400",
              "createTime": 1572230440000,
              "updateTime": 1572230440000,
              "taskNumber": "572ba60f-25ca-4840-995d-9f973d2d8e5d",
              "produceOrderNumber": "C4001910280009",
              "grouponOrderNumber": "DGRB201910281454185993",
              "grouponProductName": "线下纸板补单",
              "associatedOrders": "DGRB201910281454185993",
              "productLength": 66.00,
              "productWidth": 66.00,
              "productHeight": 66.00,
              "orderFlag": 0,
              "staveType": "普通压线",
              "orderType": 2,
              "customerId": "9f37ac84-25c0-48ff-8a5f-01d6d59394df",
              "customerName": "线下陈薇",
              "hformula": "4.0+66+66+66+66",
              "affluxTime": 1572230440000,
              "arriveTime": 1572228716000,
              "isDeleted": 0,
              "remark": null,
              "linkMan": "1111",
              "linkAddress": "紫霞街2-103号",
              "lineId": "c373e5c0-4931-4339-9b7a-3e71f472013d",
              "lineNum": "1",
              "slimachKnifeCount": 7,
              "materialId": "bb03f420-2017-4bef-b884-e40803deabde",
              "materialCode": "B434C",
              "layer": 5,
              "tileModel": "BC",
              "topSheet": "B",
              "corePaper1": "4",
              "facePaper1": "3",
              "corePaper2": "4",
              "facePaper2": "C",
              "corePaper3": null,
              "facePaper3": null,
              "materialGram": 531.95,
              "listNumber": "201910280004",
              "stackFlag": 1,
              "packCount": 10,
              "pieceAmount": 66,
              "produceAmount": 66,
              "materialLength": 268.00,
              "orderMeter": 176,
              "cutCount": 1,
              "knifeCount": 66,
              "vformula": "33.3+66+33.3",
              "paperSize": 1350,
              "materialWidth": 132.60,
              "trimming": 24,
              "trimmingRate": 0.0178
            }, {
              "rowId": "4174",
              "id": "aed50c29-f92c-11e9-9e95-00163e120883",
              "operatorId": "4000001",
              "operator": "吴伟",
              "supplierId": "400",
              "createTime": 1572230612000,
              "updateTime": 1572230612000,
              "taskNumber": "2f49d3c9-b3fc-4d93-a37c-7195d299a03b",
              "produceOrderNumber": "C4001910280011",
              "grouponOrderNumber": "DGRB201910281454247125",
              "grouponProductName": "线下纸板订单",
              "associatedOrders": "DGRB201910281454247125",
              "productLength": 55.00,
              "productWidth": 55.00,
              "productHeight": 55.00,
              "orderFlag": 0,
              "staveType": "普通压线",
              "orderType": 1,
              "customerId": "9f37ac84-25c0-48ff-8a5f-01d6d59394df",
              "customerName": "线下陈薇",
              "hformula": "3.0+55+55+55+55",
              "affluxTime": 1572230612000,
              "arriveTime": 1572228716000,
              "isDeleted": 0,
              "remark": null,
              "linkMan": "12",
              "linkAddress": "紫霞街2-103号",
              "lineId": "c373e5c0-4931-4339-9b7a-3e71f472013d",
              "lineNum": "1",
              "slimachKnifeCount": 7,
              "materialId": "bb03f420-2017-4bef-b884-e40803deabde",
              "materialCode": "B434C",
              "layer": 5,
              "tileModel": "BC",
              "topSheet": "B",
              "corePaper1": "4",
              "facePaper1": "3",
              "corePaper2": "4",
              "facePaper2": "C",
              "corePaper3": null,
              "facePaper3": null,
              "materialGram": 531.95,
              "listNumber": "201910280005",
              "stackFlag": 1,
              "packCount": 15,
              "pieceAmount": 55,
              "produceAmount": 55,
              "materialLength": 223.00,
              "orderMeter": 122,
              "cutCount": 1,
              "knifeCount": 55,
              "vformula": "27.8+55+27.8",
              "paperSize": 1200,
              "materialWidth": 110.60,
              "trimming": 94,
              "trimmingRate": 0.0783
            }, {
              "rowId": "4181",
              "id": "c942bae6-f92c-11e9-9e95-00163e120883",
              "operatorId": "4000001",
              "operator": "吴伟",
              "supplierId": "400",
              "createTime": 1572230657000,
              "updateTime": 1572230657000,
              "taskNumber": "33c02df4-527e-44c1-a987-9db97afe219f",
              "produceOrderNumber": "B4001910280010",
              "grouponOrderNumber": "DGRB201910281454236471",
              "grouponProductName": "线下纸箱补单",
              "associatedOrders": "DGRB201910281454236471",
              "productLength": 33.00,
              "productWidth": 33.00,
              "productHeight": 33.00,
              "orderFlag": 0,
              "staveType": "普通压线",
              "orderType": 5,
              "customerId": "9f37ac84-25c0-48ff-8a5f-01d6d59394df",
              "customerName": "线下陈薇",
              "hformula": "4.0+33+33+33+33",
              "affluxTime": 1572230657000,
              "arriveTime": 1572228716000,
              "isDeleted": 0,
              "remark": null,
              "linkMan": "11223",
              "linkAddress": "文一西路836",
              "lineId": "c373e5c0-4931-4339-9b7a-3e71f472013d",
              "lineNum": "1",
              "slimachKnifeCount": 7,
              "materialId": "bb03f420-2017-4bef-b884-e40803deabde",
              "materialCode": "B434C",
              "layer": 5,
              "tileModel": "BC",
              "topSheet": "B",
              "corePaper1": "4",
              "facePaper1": "3",
              "corePaper2": "4",
              "facePaper2": "C",
              "corePaper3": null,
              "facePaper3": null,
              "materialGram": 531.95,
              "listNumber": "201910280006",
              "stackFlag": 0,
              "packCount": 50,
              "pieceAmount": 100,
              "produceAmount": 100,
              "materialLength": 136.00,
              "orderMeter": 68,
              "cutCount": 2,
              "knifeCount": 50,
              "vformula": "16.75+33.0+16.75",
              "paperSize": 1350,
              "materialWidth": 66.50,
              "trimming": 20,
              "trimmingRate": 0.0148
            }, {
              "rowId": "4188",
              "id": "e2b12bcd-f92c-11e9-9e95-00163e120883",
              "operatorId": "4000001",
              "operator": "吴伟",
              "supplierId": "400",
              "createTime": 1572230694000,
              "updateTime": 1572230694000,
              "taskNumber": "22d0df69-341c-4b01-b9c5-7d7d2c9cf28a",
              "produceOrderNumber": "B4001910280013",
              "grouponOrderNumber": "DGRB201910281454843201",
              "grouponProductName": "线下纸箱订单",
              "associatedOrders": "DGRB201910281454843201",
              "productLength": 67.00,
              "productWidth": 67.00,
              "productHeight": 67.00,
              "orderFlag": 0,
              "staveType": "普通压线",
              "orderType": 4,
              "customerId": "9f37ac84-25c0-48ff-8a5f-01d6d59394df",
              "customerName": "线下陈薇",
              "hformula": "3.5+67+67+67+67",
              "affluxTime": 1572230694000,
              "arriveTime": 1572228716000,
              "isDeleted": 0,
              "remark": null,
              "linkMan": "收货人",
              "linkAddress": "车站大道2号",
              "lineId": "c373e5c0-4931-4339-9b7a-3e71f472013d",
              "lineNum": "1",
              "slimachKnifeCount": 7,
              "materialId": "bb03f420-2017-4bef-b884-e40803deabde",
              "materialCode": "B434C",
              "layer": 5,
              "tileModel": "BC",
              "topSheet": "B",
              "corePaper1": "4",
              "facePaper1": "3",
              "corePaper2": "4",
              "facePaper2": "C",
              "corePaper3": null,
              "facePaper3": null,
              "materialGram": 531.95,
              "listNumber": "201910280007",
              "stackFlag": 0,
              "packCount": 10,
              "pieceAmount": 67,
              "produceAmount": 67,
              "materialLength": 271.50,
              "orderMeter": 181,
              "cutCount": 1,
              "knifeCount": 67,
              "vformula": "33.8+67+33.8",
              "paperSize": 1400,
              "materialWidth": 134.60,
              "trimming": 54,
              "trimmingRate": 0.0386
            }]
          }
          const {list, total} = rs;
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
