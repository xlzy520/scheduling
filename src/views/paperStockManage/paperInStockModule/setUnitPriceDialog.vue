<template>
  <dj-dialog ref="dialog" @close="confirmClose" width="1160px" title="设置单价" @confirm="confirm">
    <div v-loading="isTableLoading">
      <p class="font-subhead">基础信息</p>
      <dj-form ref="form" labelSuffix=":" :formData="formData" :formOptions="formOptions" :column-num="3"
               :col-rule="colRule"></dj-form>
      <p class="font-subhead">纸筒信息</p>
      <base-table ref="table"
                  :data="tableData"
                  max-height="370"
                  :columns="tableColumns"
                  :column-type="['index']">
      </base-table>
    </div>
  </dj-dialog>
</template>
<script>
  import {djForm} from 'djweb';
  import {cylinderKeys, paperKeys} from "../../../utils/system/constant/dataKeys";
  import tableInput from './tableInput.vue';
  import paperWarehouseService from '../../../api/service/paperWarehouse';

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
              prop: cylinderKeys.deliveryBillId,
              label: '送货单号'
            }
          },
          {
            formItem: {
              prop: cylinderKeys.forkliftDriverName,
              label: '叉车员',
              // rules: [rules.required('')]
            }
          },
          {
            formItem: {
              prop: cylinderKeys.storageType,
              label: '入库类型',
              rules: [rules.required('')]
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
              }, 0).toFixed(2);
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
            width: 150
          },
          {
            prop: paperKeys.paperNumber,
            label: '原纸编号',
            width: 139,
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
            width: 101,
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
            width: 103,
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
            prop: cylinderKeys.unitPrice,
            label: '单价',
            width: 96,
            propsHandler: (props) => {
              return {...props, reg: this.$reg.getFloatReg(3), maxlength: 6, disabled: props.row['disabled'], 'class': {'is-error': props.row['isError']}}
            },
            component: tableInput,
            listeners: {
              input: (val, {row}) => {
                let _val = parseFloat(val)*parseFloat(row[cylinderKeys.weight]);
                this.$set(row, cylinderKeys.money, isNaN(_val) || _val === 0 ? '' : _val);
                if (row['isError']) {
                  this.$set(row, 'isError', false);
                }
              }
            }
          },
          {
            prop: cylinderKeys.money,
            label: '金额',
            width: 105,
            formatter(row, index, cur) {
              // cur = cur || 0;
              if (cur) {
                cur = Number(cur).toFixed(2);
              }
              return cur;
            }
          },
          {
            prop: paperKeys.paperStatus,
            label: '原纸状态',
            formatter(row, index, cur) {
              return cur ? '已出库' : '已入库';
            }
          },
        ],
        isTableLoading: false,
        defaultTableData: []
      };
    },
    created() {},
    methods: {
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 24 : 8;
      },
      confirm() {
        this.$refs.form.validate(()=>{
          if (!this.changeCheck()) {
            this.$message('未编辑数据，请确认', 'error');
            return;
          }
          this.tableData.forEach(obj=>{
            let unitPrice = Number(obj[cylinderKeys.unitPrice]) || '';
            obj[cylinderKeys.unitPrice] = unitPrice;
          });
          let post = {
            id: this.formData.id,
            tubeList: this.tableData
          };
          this.dj_api_extend(paperWarehouseService.setAmount, post).then((res) => {
            this.$emit('success');
            this.$message('操作成功');
            this.close();
          }).catch((res)=>{
            let arr = res.data || [];
            let map = arr.reduce((map, str) => {
              map[str] = true;
              return map;
            }, {});
            this.tableData.map(obj=>{
              if (map[obj[cylinderKeys.cylinderNo]]) {
                this.$set(obj, 'isError', true);
              }
            });
          });
        });
      },
      open(param) {
        this.$refs.dialog.open();
        this.isTableLoading = true;
        this.dj_api_extend(paperWarehouseService.getPaperInStorage, param).then(res=>{
          this.formData = res;
          this.tableData = res.tubeList.map(obj=>{
            obj['disabled'] = Boolean(Number(obj[cylinderKeys.unitPrice]));
            return obj;
          });
          this.saveDefaultData();
        }).finally(()=>{
          this.isTableLoading = false;
        });
      },
      saveDefaultData() {
        this.defaultTableData = this.$method.deepClone(this.tableData);
      },
      changeCheck() {
        let tableKeys = [cylinderKeys.unitPrice];
        let longTable = this.tableData;
        let shortTable = this.defaultTableData;
        if (this.defaultTableData.length > this.tableData.length) {
          longTable = this.defaultTableData;
          shortTable = this.tableData;
        }
        return !longTable.every((obj, index) => tableKeys.every(key=>(Number(obj[key]) === Number((shortTable[index] || {})[key])) || (['', undefined, null].includes(obj[key]) && ['', undefined, null].includes((shortTable[index] || {})[key]))));
      },
      confirmClose() {
        if (this.changeCheck()) {
          this.$confirm('信息未保存，确认是否关闭？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.close();
          });
        } else {
          this.close();
        }
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
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
  .base-table /deep/ .is-error .el-input__inner {
    border-color: red;
  }
</style>
