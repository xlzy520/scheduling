<template>
    <dj-dialog ref="dialog" @close="close" width="872px" title="查看">
      <el-tabs v-loading="isTableLoading" v-model="activeTab" @tab-click="handleClick">
        <el-tab-pane label="基础信息" name="1">
          <dj-form v-bind="formAttrs" ref="form" :form-data="formData" :form-options="formOptions" :column-num="3" :col-rule="colRule"></dj-form>
          <!--<p class="font-subhead">纸筒信息</p>-->
          <p class="font-subhead">
            纸筒信息
            <span class="sub-title">
              <span>总重量：{{formData[cylinderKeys.totalWeight]}}kg</span>
              <span>破损总重量：{{formData['totalDamagedWeight']}}kg</span>
              <span>总件数：{{formData[cylinderKeys.totalAmount]}}件</span>
              <span v-if="isShowMoney">总金额：{{formData[cylinderKeys.totalMoney] || 0}}元</span>
              <span v-if="isShowMoney">折扣总金额：{{formData['totalDiscount'] || 0}}元</span>
            </span>
          </p>
          <base-table ref="table"
                      :data="tableData"
                      class="input-table"
                      border
                      height="370"
                      :column-type-props="columnsTypeProps"
                      :columns="tableColumns"
                      :column-type="['index']">
          </base-table>
        </el-tab-pane>
        <el-tab-pane label="操作记录" name="2">
          <base-table :data="recordData" :columns="recordColumns"></base-table>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer">
        <el-button @click="close">关闭</el-button>
      </div>
    </dj-dialog>
</template>
<script>
  import { cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  import paperWarehouseService from '../../../api/service/paperWarehouse';
  import record from "../../../api/service/record";
  import dialogFixed from "../../../mixins/dialogFixed";
  const formAttrs = {
    labelPosition: "left",
    labelWidth: "",
    labelSuffix: ":"
  };
  export default {
    name: 'lookDialog',
    data: function () {
      return {
        // formOptions: [
        //   {
        //     formItem: {
        //       prop: cylinderKeys.documentNo,
        //       label: '单据编号'
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.paperSupplierName,
        //       label: '原纸供应商'
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.deliveryNumber,
        //       label: '送货车号'
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.storageType,
        //       label: '入库类型',
        //       rules: [rules.required('入库类型不能为空')]
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.deliveryBillId,
        //       label: '送货单号'
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.forkliftDriverName,
        //       label: '叉车员'
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.totalWeight,
        //       label: '总重量'
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.totalAmount,
        //       label: '总件数'
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.totalMoney,
        //       label: '总金额'
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.remark,
        //       label: '备注信息'
        //     }
        //   }
        // ],
        formAttrs,
        formData: {},
        tableData: [],
        // tableColumns: [
        //   {
        //     prop: cylinderKeys.cylinderNo,
        //     label: '纸筒编号',
        //     width: 150
        //   },
        //   {
        //     prop: paperKeys.paperNumber,
        //     label: '原纸编号',
        //     width: 139,
        //   },
        //   {
        //     prop: paperKeys.paperGram,
        //     label: '克重(g)',
        //     width: 139,
        //   },
        //   {
        //     prop: cylinderKeys.weight,
        //     label: '重量(kg)',
        //     width: 139,
        //   },
        //   {
        //     prop: cylinderKeys.length,
        //     label: '长度(m)',
        //     width: 101,
        //   },
        //   {
        //     prop: cylinderKeys.area,
        //     label: '面积(㎡)',
        //     width: 103,
        //   },
        //   {
        //     prop: paperKeys.paperCode,
        //     label: '原纸代码',
        //     width: 129,
        //   },
        //   {
        //     prop: paperKeys.paperType,
        //     label: '原纸类型',
        //     width: 90,
        //     formatter: (row, index, cur) => {
        //       let obj = this.$enum.paperType._swap[cur] || {};
        //       return obj.label || '';
        //     }
        //   },
        //   {
        //     prop: paperKeys.paperSize,
        //     label: '门幅(mm)',
        //     width: 97,
        //   },
        //   {
        //     prop: paperKeys.warehouseName,
        //     label: '仓库',
        //     width: 139,
        //   },
        //   {
        //     prop: paperKeys.warehouseAreaName,
        //     label: '库区',
        //     width: 121,
        //   },
        //   {
        //     prop: cylinderKeys.unitPrice,
        //     label: '单价'
        //   },
        //   {
        //     prop: cylinderKeys.money,
        //     label: '金额',
        //     width: 105
        //   },
        //   {
        //     prop: paperKeys.paperStatus,
        //     label: '原纸状态',
        //     formatter(row, index, cur) {
        //       return cur ? '已出库' : '已入库';
        //     }
        //   },
        // ],
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'operateTime', width: 226},
          {label: '操作人', prop: 'operator', width: 136},
          {label: '操作内容', prop: 'operateDetail', width: 454}
        ],
        columnsTypeProps: {
          index: {
            width: 64,
            fixed: false
          }
        },
        activeTab: '1',
        // isShowMoney: true,
        isTableLoading: true,
        id: '',
        cylinderKeys
      };
    },
    mixins: [dialogFixed],
    mounted() {},
    computed: {
      isShowMoney() {
        return this.$store.getters.amountPermission;
      },
      formOptions() {
        let total_arr = [
          {
            formItem: {
              prop: cylinderKeys.documentNo,
              label: '单据编号'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.paperSupplierName,
              label: '原纸供应商'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.deliveryNumber,
              label: '送货车号'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.storageType,
              label: '入库类型',
              rules: [this.$rule.required('入库类型不能为空')]
            }
          },
          {
            formItem: {
              prop: cylinderKeys.deliveryBillId,
              label: '送货单号'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.forkliftDriverName,
              label: '叉车员'
            }
          },
          // {
          //   formItem: {
          //     prop: cylinderKeys.totalWeight,
          //     label: '总重量'
          //   }
          // },
          // {
          //   formItem: {
          //     prop: cylinderKeys.totalAmount,
          //     label: '总件数'
          //   }
          // },
          // {
          //   formItem: {
          //     prop: cylinderKeys.totalMoney,
          //     label: '总金额'
          //   }
          // },
          {
            formItem: {
              prop: cylinderKeys.remark,
              label: '备注信息'
            }
          }
        ];
        let hidden_arr = [];
        if (!this.isShowMoney) {
          hidden_arr = [cylinderKeys.totalMoney];
        }
        return total_arr.filter(obj=>!hidden_arr.includes(obj.formItem.prop));
      },
      tableColumns() {
        let total_arr = [
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号',
            width: 137
          },
          {
            prop: paperKeys.paperNumber,
            label: '原纸编号',
            width: 117,
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)',
            width: 85,
          },
          {
            prop: cylinderKeys.weight,
            label: '重量(kg)',
            width: 104,
          },
          {
            prop: cylinderKeys.damagedWeight,
            label: '破损重量(kg)',
            width: 139,
          },
          {
            prop: paperKeys.warehouseName,
            label: '仓库',
            width: 112,
          },
          {
            prop: paperKeys.warehouseAreaName,
            label: '库区',
            width: 112,
          },
          {
            prop: cylinderKeys.unitPrice,
            label: '单价',
            width: 88
          },
          {
            prop: cylinderKeys.money,
            label: '金额',
            width: 88
          },
          {
            prop: cylinderKeys.discountMoney,
            label: '折扣金额',
            width: 88
          },
          {
            prop: paperKeys.paperName,
            label: '原纸名称',
            width: 127,
          },
          {
            prop: paperKeys.paperCode,
            label: '原纸代码',
            width: 127,
          },
          {
            prop: paperKeys.paperType,
            label: '原纸类型',
            width: 89,
            formatter: (row, index, cur) => {
              let obj = this.$enum.paperType._swap[cur] || {};
              return obj.label || '';
            }
          },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)',
            width: 95,
          },
          {
            prop: cylinderKeys.netWeight,
            label: '净重(kg)',
            width: 95,
          },
          {
            prop: cylinderKeys.length,
            label: '长度(m)',
            width: 83,
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
            width: 89,
          },
          {
            prop: paperKeys.paperStatus,
            label: '原纸状态',
            width: 88,
            formatter(row, index, cur) {
              return cur ? '已出库' : '已入库';
            }
          },
        ];
        let hidden_arr = [];
        if (!this.isShowMoney) {
          hidden_arr = [cylinderKeys.unitPrice, cylinderKeys.money, cylinderKeys.discountMoney];
        }
        return total_arr.filter(obj=>!hidden_arr.includes(obj.prop));
      }
    },
    methods: {
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 24 : 8;
      },
      open(param) {
        this.id = param.id;
        this.$refs.dialog.open();
        // this.isShowMoney = param.isShowMoney;
        this.isTableLoading = true;
        this.dj_api_extend(paperWarehouseService.getPaperInStorage, param).then(res=>{
          res[cylinderKeys.totalMoney] = res[cylinderKeys.totalMoney] || 0;
          this.formData = res;
          this.tableData = res.tubeList;
          this.updateHeight();
        }).finally(()=>{
          this.isTableLoading = false;
        });
      },
      getRecord() {
        this.isTableLoading = true;
        this.dj_api_extend(record.list, {
          sourceId: this.id
        }).then((res) => {
          this.recordData = res.list || [];
        }).finally(() => {
          this.isTableLoading = false;
        });
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
      handleClick() {
        if (this.activeTab === '2' && !this.recordData.length) {
          this.getRecord();
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  .sub-title {
    margin-left: 36px;
    font-size: 13px;
    span {
      margin-right: 24px;
    }
  }
  .dj-form {
    /*margin-top: 9px;*/
    padding-top: 9px;
    margin-bottom: 4px;
    margin-left: 30px;
    /deep/ .el-form-item {
      margin-top: 0;
      margin-bottom: 16px;
      > label, > div {
        line-height: 22px;
      }
    }
    /deep/ .el-row:nth-last-of-type(1) {
      .dj-input-content {
        width: 100%;
      }
    }
  }
</style>
