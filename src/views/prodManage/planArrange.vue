<template>
  <single-page class="planArrange">
    <single-page v-loading="isLoading" v-if="prodLine_arr.length">
      <paper-button v-model="banPaperSize_arr"></paper-button>
      <el-tabs v-model="lineId" @tab-click="refresh">
        <el-tab-pane v-for="item in prodLine_arr"
                     :key="item.value"
                     :label="item.label"
                     :name="item.value"></el-tab-pane>
      </el-tabs>
      <div class="content">
        <single-page>
          <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
          <page-pane>
            <dj-table ref="table"
                      :data="tableData"
                      height="100%"
                      scroll-load
                      :reserve-num="1"
                      :page-size-list="[1000,2000,3000]"
                      :defaultPageSize="1000"
                      :total="total"
                      :row-class-name="rowClassName"
                      :column-type-props="columnsTypeProps"
                      :loading="isTableLoading"
                      @selection-change="selectionChange"
                      :columns="tableColumns"
                      :column-type="columnType"
                      @update-data="getList">
              <div slot="btn">
                <div>
                  <el-button v-if="selectList.length" type="primary" @click="openDialog('changeProdLineDialog', selectList, true)">更换生产线</el-button>
                  <el-button v-if="selectList.length" type="primary" @click="openDialog('editPaperSizeDialog', selectList, true)">修改门幅</el-button>
                  <dj-button type="primary" @click="sort">排序</dj-button>
                  <dj-button v-if="selectList.length" type="primary" @click="calcPaperSize">计算门幅</dj-button>
                  <dj-button v-if="$enum.basketType['big'].value === prodLine_arr_map[lineId]['basketType']" type="primary" @click="stackUp">叠单</dj-button>
                  <el-button v-if="selectList.length" type="primary" @click="handleOperate('importProd', true)">汇入生产</el-button>
                  <el-button v-if="selectList.length" @click="openDialog('changeSortDialog', selectList, true)">调整排序</el-button>
                  <el-button v-if="selectList.length" @click="handleOperate('remove')">移除订单</el-button>
                </div>
                <p class="font-total">总米数：{{totalMeter}}</p>
              </div>
            </dj-table>
          </page-pane>
        </single-page>
      </div>
    </single-page>
    <div v-loading="isLoading" v-else class="empty-text">
      暂无生产线
    </div>
    <edit-paper-size-dialog ref="editPaperSizeDialog" v-if="editPaperSizeDialogFlag" @close="editPaperSizeDialogFlag = false" @success="refresh"></edit-paper-size-dialog>
    <change-sort-dialog ref="changeSortDialog" v-if="changeSortDialogFlag" @close="changeSortDialogFlag = false" @success="refresh"></change-sort-dialog>
    <look-dialog ref="lookDialog" v-if="lookDialogFlag" @close="lookDialogFlag = false" @success="refresh"></look-dialog>
    <edit-dialog ref="editDialog" v-if="editDialogFlag" @close="editDialogFlag = false" @success="refresh"></edit-dialog>
    <change-prod-line-dialog ref="changeProdLineDialog" v-if="changeProdLineDialogFlag" @close="changeProdLineDialogFlag = false" @success="refresh"></change-prod-line-dialog>
    <edit-stack-dialog ref="editStackDialog" v-if="editStackDialogFlag" @close="editStackDialogFlag = false" @success="refresh"></edit-stack-dialog>
  </single-page>
</template>
<script>
  import {orderKeys, paperKeys} from "../../utils/system/constant/dataKeys";
  import planArrangeService from "../../api/service/planArrange";
  import productionLineService from "../../api/service/productionLine";
  import prodTaskService from "../../api/service/prodTask";
  import materialSizeInput from "../../components/materialSizeInput";
  import paperSizeRange from "../../components/paperSizeRange";
  import editPaperSizeDialog from "./planArrangeModule/editPaperSizeDialog";
  import changeSortDialog from "./planArrangeModule/changeSortDialog";
  import lookDialog from "./planArrangeModule/lookDialog";
  import editDialog from "./planArrangeModule/editDialog";
  import paperButton from "./planArrangeModule/paperButton";
  import changeProdLineDialog from "./planArrangeModule/changeProdLineDialog";
  import editStackDialog from "./planArrangeModule/editStackDialog";
  export default {
    name: 'planArrange',
    data: function () {
      return {
        prodLine_arr: [],
        prodLine_arr_map: [],
        searchConfig: [
          {
            type: 'input',
            key: orderKeys.productionNo,
            label: '生产编号',
          },
          {
            key: orderKeys.fluteType,
            label: '瓦楞楞型',
            type: 'custom',
            attrs: {
              default: ['all']
            },
            component: {
              props: ['value', 'default'],
              render(h) {
                // 全选逻辑
                const input = (arr) => {
                  let realArr;
                  let lastValue = arr[arr.length - 1];
                  if (lastValue === 'all') {
                    realArr = [lastValue];
                  } else {
                    realArr = arr.filter(val => val !== 'all');
                  }
                  if (!arr.length) {
                    realArr = ['all'];
                  }
                  this.$emit('input', realArr);
                };
                return (
                  <dj-select value={this.value}
                             collapse-tags
                             type="multiple"
                             default={this.default}
                             options={this.$enum.fluteType}
                             onInput={input}
                  ></dj-select>
                );
              }
            }
          },
          {
            type: 'input',
            key: orderKeys.produceMaterial,
            label: '用料代码',
          },
          {
            type: 'custom',
            key: orderKeys.materialSize,
            label: '下料规格',
            component: materialSizeInput,
            attrs: {
              default: [],
              reg: this.$reg.getFloatReg(1)
            }
          },
          {
            type: 'select',
            key: orderKeys.orderTip,
            label: '订单标记',
            attrs: {
              default: '',
              options: this.$enum.orderTip._arr
            }
          },
          {
            type: 'input',
            key: orderKeys.customerName,
            label: '客户名称',
          },
          {
            type: 'custom',
            key: 'paperSizeRange',
            label: '门幅范围',
            component: paperSizeRange,
            attrs: {
              default: [],
              reg: /^\d*$/
            }
          },
        ],
        tableData: [],
        tableData_index_map: {},
        columnsTypeProps: {
          selection: {
            width: 50,
            // fixed: false
          }
        },
        columnType: ['selection'],
        tableColumns: [
          {
            prop: 'operate',
            label: '操作',
            fixed: 'right',
            width: 175,
            render: (h, {props: {row}}) => {
              // let arr = [];
              // let obj = this.$enum.mergeStatus._swap[this.lineId] || {};
              // if (obj.value === 'wait') {
              //   arr.push((<a on-click={()=>{this.openDialog('editDialog', row);}}>编辑</a>));
              //   arr.push((<span></span>));
              // }
              // arr.push((<a on-click={()=>{this.openDialog('lookDialog', row);}}>查看</a>));
              return (
                <div class="td-btn-group">
                  <a on-click={()=>{this.openDialog('editDialog', row);}}>编辑</a>
                  <span></span>
                  <a on-click={()=>{this.openDialog('editStackDialog', row);}}>叠单标记</a>
                  <span></span>
                  <a on-click={()=>{this.openDialog('lookDialog', row);}}>查看</a>
                </div>
              );
            }
          },
          {
            prop: orderKeys.sortIndex,
            label: '排序',
            width: 85,
          },
          {
            prop: orderKeys.orderTip,
            label: '订单标记',
            width: 114,
            render: (h, {props: {row, col}}) => {
              let obj = this.$enum.orderTip._swap[row[col.prop]] || {};
              let text = obj.omit || '';
              let key = obj.value || '';
              return (
                <span class={key ? key : '' }>{text}</span>
              );
            }
          },
          {
            prop: orderKeys.productionNo,
            label: '生产编号',
            width: 130
          },
          {
            prop: orderKeys.customerName,
            label: '客户名称',
            width: 115
          },
          {
            prop: orderKeys.produceMaterial,
            label: '用料代码',
            width: 114
          },
          {
            prop: orderKeys.fluteType,
            label: '瓦楞楞型',
            width: 114,
            formatter(row, index, cur) {
              let layer = row[orderKeys.layer] || '';
              let fluteType = cur || '';
              return layer + fluteType;
            }
          },
          {
            prop: orderKeys.materialSize,
            label: '下料规格(cm)',
            width: 144,
            formatter(row) {
              let materialLength = row[orderKeys.materialLength] || '';
              let materialWidth = row[orderKeys.materialWidth] || '';
              return materialLength && materialWidth ? materialLength + '*' + materialWidth : '';
            }
          },
          {
            prop: orderKeys.orderAmount,
            label: '订单数量',
            width: 114
          },
          {
            prop: orderKeys.productAmount,
            label: '生产数量',
            width: 114
          },
          {
            prop: orderKeys.optimalSize,
            label: '最优门幅',
            width: 114,
          },
          {
            prop: orderKeys.cutNumber,
            label: '切数',
            width: 86,
          },
          {
            prop: orderKeys.cutterNumber,
            label: '刀数',
            width: 86,
          },
          {
            prop: orderKeys.orderMetres,
            label: '订单米数',
            width: 114,
          },
          {
            prop: orderKeys.trim,
            label: '修边',
            width: 86,
          },
          {
            prop: orderKeys.trimRate,
            label: '修边率',
            width: 100,
          },
          {
            prop: orderKeys.stackUp,
            label: '叠单',
            width: 86,
            formatter(row, index, cur) {
              return cur + '' === '0' ? '' : cur;
            }
          }
        ],
        total: 0,
        totalMeter: 0,
        searchData: {},
        lineId: undefined,
        selectList: [],
        banPaperSize_arr: [],
        isLoading: false,

        editPaperSizeDialogFlag: false,
        changeSortDialogFlag: false,
        lookDialogFlag: false,
        editDialogFlag: false,
        changeProdLineDialogFlag: false,
        editStackDialogFlag: false,
        isTableLoading: false
      };
    },
    created() {
      this.getAllLine().then(()=>{
        this.$nextTick(()=>{
          this.$refs.search && this.$refs.search.search({});
        });
      });
    },
    activated() {
      this.getAllLine().then(()=>{
        this.$nextTick(()=>{
          this.$refs.search && this.$refs.search.search({});
        });
      });
    },
    mounted() {},
    methods: {
      rowClassName({row}) {
        if (row[orderKeys.stackUp] + '' === '0') {
          return 'is-error';
        }
      },
      getAllLine() {
        this.isLoading = true;
        return this.dj_api_extend(productionLineService.list).then(res=>{
          let map = {};
          this.prodLine_arr = (res.list || []).filter(obj=>obj.isEffected).map(obj=>{
            obj.label = obj['lineNum'] + '号线';
            obj.value = obj['id'];
            map[obj['id']] = obj;
            return obj;
          });
          this.prodLine_arr_map = map;
          this.lineId = (this.prodLine_arr[0] || {}).value;
        }).finally(()=>{
          this.isLoading = false;
        });
      },
      selectionChange(selectList) {
        this.selectList = selectList.sort((a, b)=>{
          let a_index = this.tableData_index_map[a[orderKeys.productionNo]];
          let b_index = this.tableData_index_map[b[orderKeys.productionNo]];
          return a_index - b_index;
        });
      },
      getTotalMeters() {
        this.dj_api_extend(planArrangeService.getTotalMeters, {lineId: this.lineId}).then(res=>{
          this.totalMeter = res || 0;
        });
      },
      getList(page) {
        this.selectList = [];
        let post = {
          ...this.searchData,
          ...page,
        };
        post['lineId'] = this.lineId;
        this.isTableLoading = true;
        this.getTotalMeters();
        this.dj_api_extend(planArrangeService.list, post).then(res=>{
          this.total = res.total || 0;
          this.tableData = res.list || [];
          this.tableData_index_map = this.tableData.reduce((map, obj, index)=>{
            map[obj[orderKeys.productionNo]] = index;
            return map;
          }, {});
        }).finally(()=>{
          // this.tableData = [{}, {}];
          this.isTableLoading = false;
        });
      },
      search(query) {
        let tileModel = query[orderKeys.fluteType].filter(str=>str !== 'all');
        let materialSize = query[orderKeys.materialSize] || [];
        let paperSizeRange = query['paperSizeRange'] || [];
        query['startPaperSize'] = paperSizeRange[0];
        query['endPaperSize'] = paperSizeRange[1];
        query[orderKeys.materialWidth] = materialSize[1];
        query[orderKeys.materialLength] = materialSize[0];
        query[orderKeys.fluteType] = tileModel.length ? tileModel : null;
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      handleOperate(type, bool) {
        if (!this.selectList.length && !bool) {
          this.$message('请选择订单', 'error');
          return;
        }
        if (type === 'importProd' && this.$enum.basketType['big'].value === this.prodLine_arr_map[this.lineId]['basketType'] && this.selectList.some(obj=>['', undefined, null].includes(obj[orderKeys.stackUp]))) {
          this.$message('请先进行排序叠单', 'error');
          return;
        }
        let map = {
          importProd: {
            api: prodTaskService.toProduceManager,
            post: {produceOrderNumbers: this.$method.getOrderList(this.selectList), lineId: this.lineId},
            tip: '确认汇入所选订单？',
            msg: '汇入订单成功'
          },
          remove: {
            api: planArrangeService.removeOrder,
            tip: '确认移除所选订单？',
            msg: '移除成功',
            post: {orderList: this.$method.getOrderList(this.selectList), lineId: this.lineId},
          },
        };
        let obj = map[type];
        if (obj) {
          this.$method.tipBox(obj.tip, ()=>{
            return this.dj_api_extend(obj.api, obj.post).then(()=>{
              this.$message(obj.msg);
              this.refresh();
            });
          });

          // this.$confirm(obj.tip, '提示', {
          //   confirmButtonText: '确 认',
          //   cancelButtonText: '取 消',
          //   type: 'warning',
          //   showClose: false,
          //   beforeClose: (action, instance, done) => {
          //     console.log(action);
          //     if (action === 'confirm') {
          //       instance.confirmButtonLoading = true;
          //       this.dj_api_extend(obj.api, this.selectList).then(()=>{
          //         this.$message(obj.msg);
          //         this.refresh();
          //         done();
          //       }).catch(e=>{
          //
          //       }).finally(()=>{
          //         instance.confirmButtonLoading = false;
          //       });
          //     } else {
          //       done();
          //     }
          //   }
          // }).then(()=>{});

          // this.$confirm(obj.tip, '', {
          //   type: 'warning',
          //   showClose: false,
          // }).then(() => {
          //   this.dj_api_extend(obj.api, this.selectList).then(()=>{
          //     this.$message(obj.msg);
          //     this.refresh();
          //   });
          // });
        }
      },
      openDialog(name, row, bool) {
        if (bool && !this.selectList.length) {
          this.$message('请选择订单', 'error');
          return;
        }
        this[name + 'Flag'] = true;
        this.$nextTick(() => {
          this.$refs[name].open({data: row, lineId: this.lineId});
        });
      },
      sort(cb) {
        this.dj_api_extend(planArrangeService.sort, {lineId: this.lineId}).then(()=>{
          this.$message('排序成功');
          this.refresh();
        }).finally(cb);
      },
      stackUp(cb) {
        this.$message('叠单中', 'info');
        this.dj_api_extend(planArrangeService.stackUp, {lineId: this.lineId}).then(()=>{
          this.$message('叠单成功');
          this.refresh();
        }).finally(cb);
      },
      calcPaperSize(cb) {
        this.$message('计算中', 'info');
        this.dj_api_extend(planArrangeService.calcPaperSize, {banList: this.banPaperSize_arr, orderList: this.$method.getOrderList(this.selectList), lineId: this.lineId}).then(()=>{
          this.$message('计算门幅成功');
          this.refresh();
        }).finally(cb);
      },
      refresh() {
        this.$refs.table.updateData();
      },
    },
    components: {editPaperSizeDialog, changeSortDialog, lookDialog, editDialog, paperButton, changeProdLineDialog, editStackDialog}
  };
</script>
<style lang="less" scoped>
  .planArrange {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    height: calc(~'100% - 10px');
    /*box-sizing: border-box;*/
    .content {
      flex: 1 1;
      position: relative;
    }
    .dj-table-container {
      /deep/ .urgent {
        color: #FF0000;
      }
      /deep/ .delay {
        color: #F89816;
      }
      /deep/ .is-error {
        color: red;
      }
    }
    /*.el-tabs {*/
      /*margin: 0 32px;*/
    /*}*/
    .font-total {
      font-size: 16px;
      margin-top: 16px;
    }
    .empty-text {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
