<template>
    <dj-dialog ref="dialog" @close="close" width="1160px" title="查看">
      <el-tabs v-model="activeTab" @tab-click="handleClick">
        <el-tab-pane label="基础信息" name="1">
          <dj-form labelSuffix=":" ref="form" :formData="formData" :formOptions="formOptions" :column-num="3"></dj-form>
          <p class="font-subhead">纸筒信息</p>
          <base-table ref="table"
                      :data="tableData"
                      max-height="500"
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
  import {djForm} from 'djweb';
  import { cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  import paperWarehouseService from '../../../api/service/paperWarehouse';

  const {rules} = djForm;
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
        //       prop: cylinderKeys.usePersonName,
        //       label: '领用部门/领用人',
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.useGroup,
        //       label: '领用单元',
        //     }
        //   },
        //   {
        //     formItem: {
        //       prop: cylinderKeys.outStockType,
        //       label: '出库类型',
        //       // rules: [rules.required('')]
        //     }
        //   },
        //   // {
        //   //   formItem: {
        //   //     prop: cylinderKeys.useDepartmentName,
        //   //     label: '领用部门'
        //   //   }
        //   // },
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
        formData: {},
        tableData: [],
        // tableColumns: [
        //   {
        //     prop: cylinderKeys.cylinderNo,
        //     label: '纸筒编号',
        //     width: 123,
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
        //     width: 98,
        //   },
        //   {
        //     prop: cylinderKeys.area,
        //     label: '面积(㎡)',
        //     width: 91,
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
        //     prop: cylinderKeys.paperSupplierName,
        //     label: '原纸供应商',
        //     width: 156,
        //   },
        //   {
        //     prop: cylinderKeys.money,
        //     label: '金额'
        //   },
        // ],
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'time', width: 226},
          {label: '操作人', prop: 'operator', width: 136},
          {label: '操作内容', prop: 'event', width: 742}
        ],
        activeTab: '1',
        isShowMoney: false
      };
    },
    computed: {
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
              prop: cylinderKeys.usePersonName,
              label: '领用部门/领用人',
            }
          },
          {
            formItem: {
              prop: cylinderKeys.useGroup,
              label: '领用单元',
            }
          },
          {
            formItem: {
              prop: cylinderKeys.outStockType,
              label: '出库类型',
              // rules: [rules.required('')]
            }
          },
          // {
          //   formItem: {
          //     prop: cylinderKeys.useDepartmentName,
          //     label: '领用部门'
          //   }
          // },
          {
            formItem: {
              prop: cylinderKeys.forkliftDriverName,
              label: '叉车员'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.totalWeight,
              label: '总重量'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.totalAmount,
              label: '总件数'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.totalMoney,
              label: '总金额'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.remark,
              label: '备注信息'
            }
          }
        ];
        let hidden_arr = [];
        if (!this.isShowMoney) {
          hidden_arr = [cylinderKeys.totalMoney]
        }
        return total_arr.filter(obj=>!hidden_arr.includes(obj.formItem.prop))
      },
      tableColumns() {
        let total_arr = [
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号',
            width: 123,
          },
          {
            prop: paperKeys.paperCode,
            label: '原纸代码',
            width: 129,
          },
          {
            prop: paperKeys.paperType,
            label: '原纸类型',
            width: 90,
            formatter: (row, index, cur) => {
              let obj = this.$enum.paperType._swap[cur] || {};
              return obj.label || '';
            }
          },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)',
            width: 97,
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)',
            width: 139,
          },
          {
            prop: cylinderKeys.weight,
            label: '重量(kg)',
            width: 139,
          },
          {
            prop: cylinderKeys.length,
            label: '长度(m)',
            width: 98,
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
            width: 91,
          },
          {
            prop: paperKeys.warehouseName,
            label: '仓库',
            width: 139,
          },
          {
            prop: paperKeys.warehouseAreaName,
            label: '库区',
            width: 121,
          },
          {
            prop: cylinderKeys.paperSupplierName,
            label: '原纸供应商',
            width: 156,
          },
          {
            prop: cylinderKeys.money,
            label: '金额'
          },
        ];
        let hidden_arr = [];
        if (!this.isShowMoney) {
          hidden_arr = [cylinderKeys.money]
        }
        return total_arr.filter(obj=>!hidden_arr.includes(obj.prop))
      }
    },
    created() {
    },
    methods: {
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 24 : 8;
      },
      open(param) {
        this.isShowMoney = param.isShowMoney;
        this.$refs.dialog.open();
        this.dj_api_extend(paperWarehouseService.getPaperOutStorage, param).then(res=>{
          this.formData = res;
          this.tableData = res.tubeList;
        });
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
      handleClick() {
        if (this.activeTab === '2' && !this.recordData.length) {
          // todo 对接获取操作记录接口
          console.log('getRecord');
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  .dj-form {
    margin-bottom: 13px;
    /deep/ .el-form-item {
      margin-bottom: 0;
    }
  }
</style>
