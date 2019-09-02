<template>
  <single-page class="plannedMerger">
    <el-tabs v-model="activeIndex" @tab-click="tabChange">
      <el-tab-pane v-for="item in mergeStatus_arr"
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
                    :total="total"
                    :loading="isTableLoading"
                    @selection-change="selectionChange"
                    :columns="tableColumns"
                    :column-type="columnType[mergeValue]"
                    :column-type-props="columnTypeProps"
                    @update-data="getList">
            <div slot="btn">
              <el-button v-if="['wait'].includes(mergeValue)" type="primary" @click="handleOperate('merge')">合并</el-button>
              <el-button v-if="['wait'].includes(mergeValue)" type="primary" @click="handleOperate('moveToBranch')">移至分线</el-button>
              <el-button v-if="['wait', 'already'].includes(mergeValue)" type="primary" @click="handleOperate('moveToSort')">移至排单</el-button>
              <el-button v-if="['wait'].includes(mergeValue)" type="primary" @click="handleOperate('remove')">移除订单</el-button>
              <el-button v-if="['already'].includes(mergeValue)" type="primary" @click="handleOperate('cancel')">取消合并</el-button>
            </div>
          </dj-table>
        </page-pane>
      </single-page>
    </div>
    <edit-dialog ref="editDialog" v-if="editDialogFlag" @close="editDialogFlag = false" @success="refresh"></edit-dialog>
    <edit-line-press-dialog ref="editLinePressDialog" v-if="editLinePressDialogFlag" @close="editLinePressDialogFlag = false" @success="refresh"></edit-line-press-dialog>
    <look-dialog ref="lookDialog" v-if="lookDialogFlag" @close="lookDialogFlag = false"></look-dialog>
  </single-page>
</template>
<script>
  import {orderKeys} from "../../utils/system/constant/dataKeys";
  import plannedMergerService from "../../api/service/plannedMerger";
  import materialSizeInput from "../../components/materialSizeInput";
  import editDialog from "./plannedMergerModule/editDialog";
  import editLinePressDialog from "./plannedMergerModule/editLinePressDialog";
  import lookDialog from "./plannedMergerModule/lookDialog";
  export default {
    name: 'plannedMerger',
    data: function () {
      return {
        mergeStatus_arr: [...this.$enum.mergeStatus._arr, {label: '全部', value: 'all'}],
        searchConfig: [
          {
            type: 'input',
            key: orderKeys.productionNo,
            label: '生产编号',
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
            type: 'custom',
            key: orderKeys.materialSize,
            label: '下料规格',
            component: materialSizeInput,
            attrs: {
              default: []
            }
          },
          {
            type: 'input',
            key: 'produceMaterial',
            label: '用料代码',
          },
          {
            type: 'input',
            key: orderKeys.customerName,
            label: '客户名称',
          },
        ],
        tableData: [],
        columnType: {
          'wait' : ['selection'],
          'already' : ['selection', 'tree'],
          'undefined' : ['tree'],
        },
        columnTypeProps: {
          selection: {
            selectable(row) {
              return !row.isChild;
            }
          },
          tree: {
            treeKey: orderKeys.productionNo,
            childNumKey: 'childNum',
            levelKey: 'table_level',
            childKey: 'childList',
            // remotePromise: (row) => {
            //   return plannedMergerService.getOrderById(this.$method.cloneData([orderKeys.productionNo], {}, row)).then(({list})=>{
            //     list.shift();
            //     list.map(obj=>{
            //       obj.isChild = true;
            //     });
            //     return list;
            //   });
            // }
          }
        },
        tableColumns: [
          {
            prop: 'operate',
            label: '操作',
            fixed: 'right',
            width: 180,
            render: (h, {props: {row}}) => {
              let arr = [];
              let obj = this.$enum.mergeStatus._swap[this.activeIndex] || {};
              if (obj.value === 'wait' && !row.isChild) {
                arr.push((<a on-click={()=>{this.openDialog('editDialog', row)}}>编辑</a>));
                arr.push((<span></span>));
              }
              if (obj.value === 'already' && !row.isChild && !(row.childNum > 1)) {
                arr.push((<a on-click={()=>{this.openDialog('editLinePressDialog', row)}}>编辑压线方式</a>));
                arr.push((<span></span>));
              }
              if (!row.isChild) {
                arr.push((<a on-click={()=>{this.openDialog('lookDialog', row)}}>查看</a>));
              }
              return (
                <div class="td-btn-group">
                  {arr}
                </div>
              );
            }
          },
          {
            prop: orderKeys.orderTip,
            label: '订单标记',
            // width: 112,
            render: (h, {props:{row, col}}) => {
              let obj = this.$enum.orderTip._swap[row[col.prop]] || {};
              let text = obj.omit || '';
              let key = obj.value || '';
              return (
                <span class={key? key : '' }>{text}</span>
              )
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
            prop: 'produceMaterial',
            label: '用料代码',
            width: 97
          },
          {
            prop: orderKeys.fluteType,
            label: '瓦楞楞型',
            width: 97,
            formatter(row, index, cur) {
              let layer = row[orderKeys.layer] || '';
              let fluteType = cur || '';
              return layer + fluteType;
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
            prop: orderKeys.productSize,
            label: '产品规格',
            width: 170
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
            prop: orderKeys.optimalSize,
            label: '最优门幅',
            width: 97,
          },
          {
            prop: orderKeys.cutNumber,
            label: '切数',
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
            prop: orderKeys.linePressingMethod,
            label: '压线方式',
            width: 97,
          },
          {
            prop: orderKeys.longitudinalPressure,
            label: '纵压公式',
            width: 120,
          },
          {
            prop: orderKeys.mergeStatus,
            label: '合并状态',
            width: 97,
            formatter: (row, index, cur) => {
              let obj = this.$enum.mergeStatus._swap[cur] || {};
              return obj.label || '';
            }
          }
        ],
        total: 0,
        searchData: {},
        activeIndex: this.$enum.mergeStatus['wait'].value,
        selectList: [],

        editDialogFlag: false,
        editLinePressDialogFlag: false,
        lookDialogFlag: false,
        isTableLoading: false
      };
    },
    computed: {
      mergeValue() {
        let obj = this.$enum.mergeStatus._swap[this.activeIndex] || {};
        return obj.value;
      }
    },
    created() {},
    mounted() {
      this.$refs.search.search({});
    },
    methods: {
      tabChange() {
        this.refresh();
      },
      selectionChange(selectList) {
        this.selectList = selectList;
      },
      handleOperate(type = 'merge') {
        if (!this.selectList.length) {
          this.$message('请选择订单', 'error');
          return;
        }
        let map = {
          merge: {
            api: plannedMergerService.mergeOrder,
            tip: '确认是否合并所选订单？',
            msg: '合并成功'
          },
          cancel: {
            api: plannedMergerService.cancelMergeOrder,
            tip: '确认取消合并所选订单？',
            msg: '取消合并成功'
          },
          moveToSort: {
            api: plannedMergerService.moveToSort,
            tip: '确认将所选订单移至计划排单？',
            msg: '移至排单成功'
          },
          moveToBranch: {
            api: plannedMergerService.moveToBranch,
            tip: '确认将所选订单移至分线任务？',
            msg: '移至分线成功'
          },
          remove: {
            api: plannedMergerService.removeOrder,
            tip: '确认移除所选订单？',
            msg: '移除订单成功'
          },
        };
        let obj = map[type];
        if (obj) {
          this.$confirm(obj.tip, '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.dj_api_extend(obj.api, {orderList: this.selectList.map(obj=>this.$method.cloneData([orderKeys.productionNo], {}, obj))}).then(()=>{
              this.$message(obj.msg);
              this.refresh();
            });
          });
        }
      },
      getList(page) {
        this.selectList = [];
        let post = {
          ...this.searchData,
          ...page,
        };
        post['isCombined'] = this.activeIndex === 'all' ? '2' : this.activeIndex;
        this.isTableLoading = true;
        this.dj_api_extend(plannedMergerService.list, post).then(res=>{
          this.total = res.total || 0;
          this.tableData = res.list || [];
        }).finally(()=>{
          this.isTableLoading = false;
        });
      },
      search(query) {
        let tileModel = query[orderKeys.fluteType].filter(str=>str !== 'all');
        let materialSize = query[orderKeys.materialSize] || [];
        query[orderKeys.materialLength] = materialSize[0];
        query[orderKeys.materialWidth] = materialSize[1];
        query[orderKeys.fluteType] = tileModel.length ? tileModel : null;
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      openDialog(name, row) {
        this[name + 'Flag'] = true;
        this.$nextTick(() => {
          this.$refs[name].open(row);
        });
      },
      refresh() {
        this.$refs.table.updateData();
      },
    },
    components: {editDialog, editLinePressDialog, lookDialog}
  };
</script>
<style lang="less" scoped>
  .plannedMerger {
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
    .el-tabs {
      margin: 0 18px;
    }
  }
</style>