<template>
  <dj-dialog ref="dialog" @close="close" width="1506px" title="设置单价" @confirm="confirm">
    <p>基础信息</p>
    <dj-form ref="form" :formData="formData" :formOptions="formOptions" :column-num="4"
             :col-rule="colRule"></dj-form>
    <p>纸筒信息</p>
    <base-table ref="table"
                :data="tableData"
                max-height="500"
                :columns="tableColumns"
                :column-type="['index']">
    </base-table>
  </dj-dialog>
</template>
<script>
  import {djForm} from 'djweb';
  import {cylinderKeys, paperKeys} from "../../../utils/system/constant/dataKeys";
  import tableInput from './tableInput';
  const {rules} = djForm;
  export default {
    name: 'setUnitPriceDialog',
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
              prop: cylinderKeys.paperSupplier,
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
              rules: [rules.required('入库类型不能为空')]
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
            },
            computed: () => {
              return this.tableData.reduce((sum, obj) => {
                sum += Number(obj[cylinderKeys.money]) || 0;
                return sum;
              }, 0);
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
            label: '纸筒编号'
          },
          {
            prop: paperKeys.paperNumber,
            label: '原纸编号'
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
            label: '长度(m)',
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
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
            prop: paperKeys.warehouseId,
            label: '仓库',
          },
          {
            prop: paperKeys.warehouseAreaId,
            label: '库区',
          },
          {
            prop: cylinderKeys.unitPrice,
            label: '单价',
            propsHandler: (props) => {
              return {...props, reg: this.$reg.getFloatReg(3)}
            },
            component: tableInput,
            listeners: {
              input: (val, {row}) => {
                this.$set(row, cylinderKeys.money, parseFloat(val)*parseFloat(row[cylinderKeys.weight]));
              }
            }
          },
          {
            prop: cylinderKeys.money,
            label: '金额',
          },
          {
            prop: paperKeys.paperStatus,
            label: '原纸状态'
          },
        ],
      };
    },
    created() {
      this.tableData = [{weight: 23}, {weight: 7}];
    },
    methods: {
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 18 : 6;
      },
      confirm() {
        console.log(this.formData);
        this.$refs.form.validate();
      },
      open(param) {
        this.$refs.dialog.open();
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    }
  };
</script>
