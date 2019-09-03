<template>
  <single-page class="table-page prod-task">
    <el-tabs stretch v-model="activeTab" @tab-click="tabClick">
      <el-tab-pane v-for="tab in tabsColumn" :key="tab.value" :label="tab.label" :name="tab.value"></el-tab-pane>
    </el-tabs>
    <div class="content">
      <single-page v-loading="loading">
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
            @update-data="getTableData"
          >
            <div slot="btn">
              <el-button type="primary" @click="removeOrder">移除订单</el-button>
              <el-button type="primary" @click="adjustSort">调整排序</el-button>
              <el-button type="primary" @click="printQRCode">打印二维码</el-button>
              <el-button type="primary" @click="printAll">打印全部</el-button>
              <el-button type="primary" @click="ViewImportRecord">查看汇入记录</el-button>
            </div>
          </dj-table>
        </page-pane>
        <adjust-sort ref="view" v-if="visibleType==='adjustSort'" @close="close" @confirm="search"></adjust-sort>
        <prod-task-view ref="view" v-if="visibleType==='view'" @close="close" ></prod-task-view>
        <import-record ref="view" v-if="visibleType==='record'" @close="close"></import-record>
      </single-page>
    </div>
</single-page>

</template>

<script>
  import dayjs from 'dayjs';
  import prodTaskService from '../../../api/service/prodTask';
  import axios from 'axios';
  import AdjustSort from "./compoents/adjustSort";
  import ProdTaskView from "./compoents/prodTaskView";
  import ImportRecord from "./compoents/importRecord";

  export default {
    name: 'ProdTask',
    components: {ImportRecord, ProdTaskView, AdjustSort},
    data() {
      return {
        activeTab: '1',
        tabsColumn: [],

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
          {label: '生产编号', key: 'produceNumber', type: 'input', attrs: {reg: /\w+/g}},
          {
            label: '下料规格', key: 'guige', type: 'custom',
            component: {
              data() {
                return {
                  start: '',
                  end: ''
                };
              },
              props: {
                value: {
                  type: Array,
                  default: () => [null, null]
                },
              },
              methods: {
                update(val) {
                  this.start = val[0];
                  this.end = val[1];
                }
              },
              render(h) {
                const input = (index, val) => {
                  const value = this.value;
                  value[index] = val;
                  this.update(value);
                  this.$emit('input', value);
                };
                return (
                  <div class="xialiaoguige">
                    <dj-input type='number' value={this.start} onInput={val => input(0, val)}
                              placeholder="切长cm" maxlength="10"/>
                    <span class="text">*</span>
                    <dj-input type='number' value={this.end} onInput={val => input(1, val)}
                              placeholder="切宽cm" maxlength="10"/>
                  </div>
                );
              }
            }
          },
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '客户名称', key: 'customerName', type: 'input'},
          {label: '订单编号', key: 'OrderNumber', type: 'input', attrs: {reg: /\w+/g}},
          {
            label: '门幅范围', key: 'menfu', type: 'custom',
            component: {
              data() {
                return {
                  start: '',
                  end: ''
                };
              },
              props: {
                value: {
                  type: Array,
                  default: () => [null, null]
                },
              },
              methods: {
                update(val) {
                  this.start = val[0];
                  this.end = val[1];
                }
              },
              render(h) {
                const input = (index, val) => {
                  const value = this.value;
                  value[index] = val;
                  this.update(value);
                  this.$emit('input', value);
                };
                return (
                  <div class="xialiaoguige">
                    <dj-input type='number' value={this.start} onInput={val => input(0, val)}
                              placeholder="切长cm" maxlength="10"/>
                    <span class="text">-</span>
                    <dj-input type='number' value={this.end} onInput={val => input(1, val)}
                              placeholder="切宽cm" maxlength="10"/>
                  </div>
                );
              }
            }
          },
        ],
        tableData: [],
        tableColumns: [
          {label: '生产编号', prop: 'produceOrderNumber', width: 120},
          {label: '客户名称', prop: 'customerName', width: 160},
          {label: '产品名称', prop: 'grouponProductName', width: 160},
          {label: '用料代码', prop: 'materialCode'},
          {label: '瓦楞楞型', prop: 'tilemodel'},
          {label: '门幅宽度', prop: 'paperSize'},
          {label: '订单米数', prop: 'orderHeight'},
          {label: '下料规格(cm)', prop: 'xialiaoguige', width: 120,
            formatter: row=>row.materialLength + '*' + row.materialWidth},
          {label: '切数', prop: 'cut', width: 120},
          {label: '切宽', prop: 'cutWidth', width: 120},
          {label: '修边', prop: 'wasteSize'},
          {label: '压线方式', prop: 'stavetype'},
          {label: '压线公式', prop: 'formula', width: 120},
          {label: '叠单', prop: 'stack'},
          {label: '打印次数', prop: 'printNum'},
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
        visibleType: ''
      };
    },
    methods: {
      tabClick(val) {
        this.$refs.search.search();
      },
      adjustSort () {
        this.visibleType = 'adjustSort';
        this.$nextTick(() => {
          this.$refs.view.open();
        });
      },
      printQRCode () {

      },
      printAll () {

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
          this.$message('请选择订单', 'info');
          return false;
        } else {
          this.$confirm('请先将所选订单从生管系统移除，再从生产任务页面移除订单', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.loading = true;
            const idList = this.checkedList.map(v=>{
              return {
                id: v.id
              };
            });
            this.dj_api_extend(prodTaskService.removeOrder, idList).then(res => {
              this.$message('移除成功', 'success');
              this.$refs.search.search();
              // 刷新页面是否记录当前生产线
            }).catch(() => {
              this.loading = false;
            });
          });

        }
      },
      selectionChange(checkedList) {
        this.checkedList = checkedList;
      },
      search(query) {
        const {timeRange, guige, ...restQuery} = query;
        let params = {
          lineId: this.activeTab,
          ...restQuery,
          startTime: timeRange[0],
          endTime: timeRange[1],
        };
        if (guige !== undefined) {
          let guigeparams = {
            materialLength: guige[0],
            materialWidth: guige[1],
          };
          Object.assign(params, guigeparams);
        }
        this.searchData = params;
        this.$refs.table.changePage(1);
      },
      getTableData(data) {
        this.loading = true;
        // this.dj_api_extend(prodTaskService.list, {
        axios.post('http://192.168.23.4:3000/mock/5d131431c07efa4fd83ae7ae/djsupplier/prodTask/list.do', {
          ...data,
          ...this.searchData
        }).then(res => {
          const {list, total} = res.data.data;
          this.tableData = list;
          this.pageTotal = total;
        }).finally(() => {
          this.loading = false;
        });
      },
      getLineData() {
        axios.post('http://192.168.23.4:3000/mock/5d131431c07efa4fd83ae7ae/djsupplier/prodTask/line-list', {}).then(res => {
          this.tabsColumn = res.data.data.list;
        });
      }
    },
    mounted() {
      this.getLineData();
      this.$refs.search.search();
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
