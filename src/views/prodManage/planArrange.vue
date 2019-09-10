<template>
  <single-page class="planArrange">
    <paper-button></paper-button>
    <el-tabs v-model="lineId" @tab-click="refresh">
      <el-tab-pane v-for="item in prodLine_arr"
                   :key="item.value"
                   :label="item.label"
                   :name="item.value"></el-tab-pane>
    </el-tabs>
    <div v-if="prodLine_arr.length" class="content">
      <single-page>
        <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
        <page-pane>
          <dj-table ref="table"
                    :data="tableData"
                    height="100%"
                    scroll-load
                    :page-size-list="[1000,2000,3000]"
                    :total="total"
                    :loading="isTableLoading"
                    @selection-change="selectionChange"
                    :columns="tableColumns"
                    :column-type="columnType"
                    @update-data="getList">
            <div slot="btn">
              <div>
                <el-button type="primary" @click="openDialog('changeProdLineDialog', selectList, true)">更换生产线</el-button>
                <el-button type="primary" @click="openDialog('editPaperSizeDialog', selectList, true)">修改门幅</el-button>
                <el-button type="primary" @click="sort">排序</el-button>
                <el-button type="primary" @click="calcPaperSize">计算门幅</el-button>
                <el-button type="primary" @click="stackUp">叠单</el-button>
                <el-button type="primary" @click="handleOperate('importProd')">汇入生产</el-button>
                <el-button @click="openDialog('changeSortDialog', selectList, true)">调整排序</el-button>
                <el-button @click="handleOperate('remove')">移除订单</el-button>
              </div>
              <p class="font-total">总米数：{{totalMeter}}</p>
            </div>
          </dj-table>
        </page-pane>
      </single-page>
    </div>
    <edit-paper-size-dialog ref="editPaperSizeDialog" v-if="editPaperSizeDialogFlag" @close="editPaperSizeDialogFlag = false" @success="refresh"></edit-paper-size-dialog>
    <change-sort-dialog ref="changeSortDialog" v-if="changeSortDialogFlag" @close="changeSortDialogFlag = false" @success="refresh"></change-sort-dialog>
    <look-dialog ref="lookDialog" v-if="lookDialogFlag" @close="lookDialogFlag = false" @success="refresh"></look-dialog>
    <edit-dialog ref="editDialog" v-if="editDialogFlag" @close="editDialogFlag = false" @success="refresh"></edit-dialog>
    <change-prod-line-dialog ref="changeProdLineDialog" v-if="changeProdLineDialogFlag" @close="changeProdLineDialogFlag = false" @success="refresh"></change-prod-line-dialog>
  </single-page>
</template>
<script>
  import {orderKeys, paperKeys} from "../../utils/system/constant/dataKeys";
  import planArrangeService from "../../api/service/planArrange";
  import productionLineService from "../../api/service/productionLine";
  import materialSizeInput from "../../components/materialSizeInput";
  import paperSizeRange from "../../components/paperSizeRange";
  import editPaperSizeDialog from "./planArrangeModule/editPaperSizeDialog";
  import changeSortDialog from "./planArrangeModule/changeSortDialog";
  import lookDialog from "./planArrangeModule/lookDialog";
  import editDialog from "./planArrangeModule/editDialog";
  import paperButton from "./planArrangeModule/paperButton";
  import changeProdLineDialog from "./planArrangeModule/changeProdLineDialog";
  export default {
    name: 'planArrange',
    data: function () {
      return {
        prodLine_arr: [],
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
            key: orderKeys.materialCode,
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
              default: []
            }
          },
        ],
        tableData: [],
        columnType: ['selection'],
        tableColumns: [
          {
            prop: 'operate',
            label: '操作',
            fixed: 'right',
            width: 180,
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
                  <a on-click={()=>{this.openDialog('lookDialog', row);}}>查看</a>
                </div>
              );
            }
          },
          {
            prop: 'order',
            label: '排序'
          },
          {
            prop: orderKeys.orderTip,
            label: '订单标记',
            width: 112,
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
            width: 150
          },
          {
            prop: orderKeys.customerName,
            label: '客户名称',
            width: 97
          },
          {
            prop: orderKeys.materialCode,
            label: '用料代码',
            width: 97
          },
          {
            prop: orderKeys.fluteType,
            label: '瓦楞楞型',
            width: 97,
            formatter(row, index, cur) {
              // let layer = row[orderKeys.layer] || '';
              let fluteType = cur || '';
              return fluteType;
            }
          },
          {
            prop: orderKeys.materialSize,
            label: '下料规格(cm)',
            width: 120,
            formatter(row) {
              let materialLength = row[orderKeys.materialLength] || '';
              let materialWidth = row[orderKeys.materialWidth] || '';
              return materialLength && materialWidth ? materialLength + '*' + materialWidth : '';
            }
          },
          {
            prop: orderKeys.orderAmount,
            label: '订单数量',
            width: 97
          },
          {
            prop: orderKeys.productAmount,
            label: '生产数量',
            width: 97
          },
          {
            prop: orderKeys.optimalSize,
            label: '最优门幅',
            width: 97,
          },
          {
            prop: orderKeys.cutNumber,
            label: '切数',
          },
          {
            prop: orderKeys.cutterNumber,
            label: '刀数',
          },
          {
            prop: orderKeys.orderMetres,
            label: '订单米数',
            width: 97,
          },
          {
            prop: orderKeys.trim,
            label: '修边'
          },
          {
            prop: orderKeys.trimRate,
            label: '修边率',
          },
          {
            prop: orderKeys.stackUp,
            label: '叠单'
          }
        ],
        total: 0,
        totalMeter: 0,
        searchData: {},
        lineId: undefined,
        selectList: [],

        editPaperSizeDialogFlag: false,
        changeSortDialogFlag: false,
        lookDialogFlag: false,
        editDialogFlag: false,
        changeProdLineDialogFlag: false,
        isTableLoading: false
      };
    },
    created() {
      // this.tableData = [{}, {}];
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
      getAllLine() {
        return this.dj_api_extend(productionLineService.list, {pageNo: 1, pageSize: 9999999}).then(res=>{
          this.prodLine_arr = (res.list || []).map(obj=>{
            obj.label = obj['lineNum'] + '号线';
            obj.value = obj['id'];
            return obj;
          });
          this.lineId = (this.prodLine_arr[0] || {}).value;
        });
      },
      selectionChange(selectList) {
        this.selectList = selectList;
      },
      getList(page) {
        this.selectList = [];
        let post = {
          ...this.searchData,
          ...page,
        };
        post['lineId'] = this.lineId;
        console.log(post);
        this.isTableLoading = true;
        this.dj_api_extend(planArrangeService.list, post).then(res=>{
          this.total = res.total || 0;
          this.tableData = res.list || [];
        }).finally(()=>{
          this.isTableLoading = false;
        });
      },
      search(query) {
        let tileModel = query[orderKeys.fluteType].filter(str=>str !== 'all');
        let materialSize = query[orderKeys.materialSize] || [];
        let paperSizeRange = query['paperSizeRange'] || [];
        query['paperSizeStart'] = paperSizeRange[0];
        query['paperSizeEnd'] = paperSizeRange[1];
        query[orderKeys.materialWidth] = materialSize[1];
        query[orderKeys.materialLength] = materialSize[0];
        query[orderKeys.materialWidth] = materialSize[1];
        query[orderKeys.fluteType] = tileModel.length ? tileModel : null;
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      handleOperate(type) {
        if (!this.selectList.length) {
          this.$message('请选择订单', 'error');
          return;
        }
        let map = {
          importProd: {
            api: planArrangeService.importProd,
            tip: '确认汇入所选订单？',
            msg: '汇入订单成功'
          },
          remove: {
            api: planArrangeService.removeOrder,
            tip: '确认移除所选订单？',
            msg: '移除成功'
          },
        };
        let obj = map[type];
        if (obj) {
          this.$confirm(obj.tip, '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.dj_api_extend(obj.api, this.selectList).then(()=>{
              this.$message(obj.msg);
              this.refresh();
            });
          });
        }
      },
      openDialog(name, row, bool) {
        if (bool && !this.selectList.length) {
          this.$message('请选择订单', 'error');
          return;
        }
        this[name + 'Flag'] = true;
        this.$nextTick(() => {
          this.$refs[name].open(row);
        });
      },
      sort() {
        this.dj_api_extend(planArrangeService.sort).then(()=>{
          this.$message('排序成功');
          this.refresh();
        });
      },
      stackUp() {
        this.dj_api_extend(planArrangeService.stackUp).then(()=>{
          this.$message('叠单成功');
          this.refresh();
        });
      },
      calcPaperSize() {
        this.dj_api_extend(planArrangeService.calcPaperSize).then(()=>{
          this.$message('计算门幅成功');
          this.refresh();
        });
      },
      refresh() {
        this.$refs.table.updateData();
      },
    },
    components: {editPaperSizeDialog, changeSortDialog, lookDialog, editDialog, paperButton, changeProdLineDialog}
  };
</script>
<style lang="less" scoped>
  .planArrange {
    padding-top: 10px;
    display: flex;
    flex-direction: column;
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
    }
    /*.el-tabs {*/
      /*margin: 0 32px;*/
    /*}*/
    .font-total {
      font-size: 16px;
      margin: 16px 0;
    }
  }
</style>
