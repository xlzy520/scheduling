<template>
    <dj-dialog ref="dialog" @close="close" width="1506px" title="查看">
      <el-tabs v-model="activeTab" @tab-click="handleClick">
        <el-tab-pane label="基础信息" name="1">
          <dj-form ref="form" :formData="formData" :formOptions="formOptions" :column-num="4"
                   :col-rule="colRule"></dj-form>
          <p>纸筒信息</p>
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
  const {rules} = djForm;
  export default {
    name: 'lookDialog',
    data: function () {
      return {
        formOptions: [
          {
            formItem: {
              prop: cylinderKeys.documentNo,
              label: '单据编号'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.usePerson,
              label: '领用人',
              rules: [rules.required('')]
            }
          },
          {
            formItem: {
              prop: cylinderKeys.useGroup,
              label: '领用班组',
              rules: [rules.required('')]
            }
          },
          {
            formItem: {
              prop: cylinderKeys.outStockType,
              label: '出库类型',
              rules: [rules.required('')]
            }
          },
          {
            formItem: {
              prop: cylinderKeys.useDepartment,
              label: '领用部门'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.forkliftDriver,
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
        ],
        formData: {},
        tableData: [],
        tableColumns: [
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号',
          },
          {
            prop: paperKeys.paperCode,
            label: '原值代码'
          },
          {
            prop: paperKeys.paperType,
            label: '原纸类型'
          },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)'
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)',
          },
          {
            prop: cylinderKeys.weight,
            label: '重量(kg)',
          },
          {
            prop: cylinderKeys.length,
            label: '长度(m)'
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
          },
          {
            prop: paperKeys.warehouseName,
            label: '仓库',
          },
          {
            prop: paperKeys.warehouseAreaName,
            label: '库区',
          },
          {
            prop: cylinderKeys.paperSupplier,
            label: '原纸供应商'
          },
          {
            prop: cylinderKeys.money,
            label: '金额'
          },
        ],
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'time'},
          {label: '操作人', prop: 'operator'},
          {label: '操作内容', prop: 'event'}
        ],
        activeTab: '1',
      };
    },
    created() {
    },
    methods: {
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 18 : 6;
      },
      open(param) {
        this.$refs.dialog.open();
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
