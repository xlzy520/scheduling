<template>
  <single-page class="table-page prod-task">
    <el-tabs stretch v-model="activeTab" @tab-click="tabClick">
      <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.lineNum+'号线'" :name="tab.id"></el-tab-pane>
    </el-tabs>
    <div class="content">
      <single-page>
        <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
        <page-pane>
          <dj-table
            ref="table"
            :data="tableData"
            :columns="tableColumns"
            :column-type="['selection', 'index']"
            @selection-change="selectionChange"
            :total="pageTotal"
            height="100%"
            :loading="loading"
            @update-data="getTableData"
            :defaultPageSize="100"
            :pageSizeList="[100,200]"
          >
            <div slot="btn">
              <el-button type="primary" @click="removeOrder">移除订单</el-button>
              <el-button type="primary" @click="adjustSort">调整排序</el-button>
              <el-button type="primary" @click="printQRCode">打印二维码</el-button>
              <el-button type="primary" @click="printAll" :loading="printLoading">打印全部</el-button>
              <el-button type="primary" @click="ViewImportRecord">查看汇入记录</el-button>
            </div>
          </dj-table>
        </page-pane>
        <adjust-sort ref="view" v-if="visibleType==='adjustSort'" @close="close" @confirm="search"></adjust-sort>
        <prod-task-view ref="view" v-if="visibleType==='view'" @close="close" ></prod-task-view>
        <import-record ref="view" v-if="visibleType==='record'" @close="close"></import-record>
      </single-page>
    </div>
    <order-tag ref="printTag" :data="printAllList" :ext-order-keys="extOrderKeys"></order-tag>
</single-page>

</template>

<script>
  import dayjs from 'dayjs';
  import prodTaskService from '../../../api/service/prodTask';
  import productionLineService from '../../../api/service/productionLine';
  import AdjustSort from "./compoents/adjustSort";
  import ProdTaskView from "./compoents/prodTaskView";
  import ImportRecord from "./compoents/importRecord";
  import materialSizeInput from "../../../components/materialSizeInput";
  import paperSizeRange from "../../../components/paperSizeRange";
  import orderTag from '../../../components/printTag/orderTag';
  const mockData = {
    "msg": "请求成功！",
    "code": "10001200",
    "data": {
      "total": 1,
      "list": [
        {
          grouponOrderNumber: 'B190916002101',//订单编号
          consignee: '杜锡龙',
          "processeAmount": 20,//打包数量

          "rowId": "1",
          "id": "0077e165-d912-11e9-8856-0619ea000039",
          "operatorId": "958",
          "operator": "东经科技",
          "createTime": 1568702038000,
          "updateTime": 1568707252000,
          "taskNumber": "T0001",
          "produceOrderNumber": "B190916002101",
          "associatedOrders": "P1911200001,P1911200002,P1911200003",//关联单号
          "grouponProductName": "A437J",
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
          "orderType": 3,
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
          "packCount": 20,//打包数量
          "pieceAmount": 500,
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
  }
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
              default: [dayjs().subtract(3, 'day').format('YYYY-MM-DD 00:00:00'), dayjs().add(40, 'day').format('YYYY-MM-DD 23:59:59')],
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
          {label: '生产编号', key: 'produceOrderNumber', type: 'input', attrs: {reg: /\w+/g}},
          {
            label: '下料规格', key: 'guige', type: 'custom',
            component: materialSizeInput
          },
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '客户名称', key: 'customerName', type: 'input'},
          {
            label: '门幅范围', key: 'paperSize', type: 'custom',
            component: paperSizeRange
          },
        ],
        tableData: [],
        tableColumns: [
          {label: '生产编号', prop: 'produceOrderNumber', width: 160},
          {label: '客户名称', prop: 'customerName'},
          {label: '产品名称', prop: 'grouponProductName'},
          {label: '用料代码', prop: 'materialCode'},
          {label: '瓦楞楞型', prop: 'tileModel'},
          {label: '门幅宽度', prop: 'paperSize'},
          {label: '订单米数', prop: 'orderMeter'},
          {label: '下料规格(cm)', prop: 'xialiaoguige', width: 120,
            formatter: row=>row.materialLength + '*' + row.materialWidth},
          {label: '切数', prop: 'cutCount', width: 120},
          {label: '切宽', prop: 'materialWidth', width: 120},
          {label: '修边', prop: 'trimming'},
          {label: '压线方式', prop: 'staveType'},
          {label: '压线公式', prop: 'vformula', width: 120},
          {label: '叠单', prop: 'stackFlag'},
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

        }
      };
    },
    methods: {
      tabClick() {
        this.$refs.search.search();
      },
      adjustSort () {
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
        this.printAllList = mockData.data.list
        this.$refs.printTag.print();
      },
      printAll () {
        this.printLoading = true;
        this.dj_api_extend(prodTaskService.list, {
          ...this.searchData,
          pageSize: 999999,
        }).then(res => {
          const {list, total} = res;
          if (total === 0) {
            this.$message('无可打印数据', 'error');
            return false;
          } else {
            list.map(v=>{
              // 后端名称不统一，所以需要转换一下
              v.pieceAmount = v.orderAmount;
            });
            this.printAllList = list;
            this.$refs.printTag.print();
          }
        }).finally(() => {
          this.printLoading = false;
        });
      },
      ViewImportRecord () {
        this.visibleType = 'record';
        this.$nextTick(() => {
          this.$refs.view.open();
        });
      },
      view(row) {
        this.visibleType = 'view';
        this.$nextTick(() => {
          this.$refs.view.open();
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
          this.$confirm('请先将所选订单从生管系统移除，再从生产任务页面移除订单', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.loading = true;
            const idList = this.checkedList.map(v=> v.id);
            this.dj_api_extend(prodTaskService.removeOrder, {
              produceOrderNumbers: idList
            }).then(res => {
              this.$message('移除成功', 'success');
            }).finally(() => {
              this.loading = false;
              this.$refs.search.search();
            });
          });

        }
      },
      selectionChange(checkedList) {
        this.checkedList = checkedList;
      },
      search(query) {
        const {timeRange, guige, paperSize, ...restQuery} = query;
        let params = {
          ...restQuery,
          'search[affluxTimeStart]': timeRange[0],
          'search[affluxTimeEnd]': timeRange[1],
        };
        if (this.activeTab) {
          params['search[lineId]'] = this.activeTab;
        }
        if (guige !== undefined) {
          let guigeParams = {
            'search[materialLengthStart]': guige[0],
            'search[materialWidthEnd]': guige[1],
          };
          Object.assign(params, guigeParams);
        }
        if (paperSize !== undefined) {
          let paperSizeParams = {
            'search[paperSizeStart]': paperSize[0],
            'search[paperSizeEnd]': paperSize[1],
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
          ...this.searchData
        }).then(res => {
          // const {list, total} = res;
          const {list, total} = mockData.data;
          this.tableData = list;
          this.pageTotal = total;
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
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .prod-task{
    display: flex;
    flex-direction: column;
    .content{
      flex: 1 1;
      position: relative;
    }
  }
  .el-tabs{
    margin: 0 18px;
  }
  @{deep} .el-tabs__nav-wrap{
    width: 70%;
    .el-tabs__nav.is-stretch{
      min-width: 80%;
    }
    .el-tabs__item{
      font-size: 16px;
      max-width: 180px;
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
      color: #3654EA;
      padding: 2px 10px;
      cursor: pointer;
    }
    .divideState-completed {
      pointer-events: none;
      color: #909399;
    }
  }

  @{deep} .cell {
    .urgent {
      color: #ff0000;
    }
    .delay {
      color: #F89816;
    }
  }

  .dialog {
    width: 1100px;
    .order-info-text {
      font-family: PingFang SC Medium, sans-serif;
      font-weight: 500;
      color: rgba(48, 49, 51, 1);
      width: 105px;
      padding: 15px 8px 15px 0;
      text-align: right;
    }
  }

</style>
