<template>
  <dj-dialog ref="dialog" @close="confirmClose" width="780px" title="调整压线方式" @confirm="confirm">
    <dj-form ref="form" :formData="formData" :formOptions="formOptions"></dj-form>
    <p class="font-subhead">原订单信息</p>
    <dj-form labelSuffix=":" :formData="formData" :formOptions="textOptions" :column-num="2"></dj-form>
  </dj-dialog>
</template>
<script>
  import {djForm} from 'djweb';
  import plannedMergerService from '../../../api/service/plannedMerger';
  import longitudinalPressureInput from '../../../components/longitudinalPressureInput';
  import {orderKeys} from "../../../utils/system/constant/dataKeys";

  const {rules} = djForm;
  const checkValue = function (rule, value, callback) {
    if (value && !value.every(val => !val || /^\d{0,4}(\.\d{0,2})?$/.test(val))) {
      callback(new Error('限0~9999两位小数'));
    } else {
      callback();
    }
  };
  export default {
    name: 'editLinePressDialog',
    data: function () {
      return {
        formOptions: [
          {
            type: 'select',
            formItem: {
              prop: orderKeys.linePressingMethod,
              label: '压线方式',
              rules: [
                // rules.required('请选择压线方式'),
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback(new Error('请选择压线方式'));
                    } else {
                      callback();
                    }
                  }
                }
              ]
            },
            attrs: {
              keyMap: {
                value: 'label'
              },
              options: this.$enum.linePressingWay._arr
            }
          },
          {
            type: 'custom',
            formItem: {
              prop: orderKeys.longitudinalPressure,
              label: '纵压公式',
              rules: [
                {validator: checkValue},
                {
                  validator: (rule, value, callback) => {
                    let materialWidth = this.formData[orderKeys.materialWidth];
                    if (value && value.reduce((sum, cur) => {
                        sum += Number(cur || 0);
                        return sum;
                      }, 0) !== Number(materialWidth)) {
                      callback(new Error('请输入正确的压线公式'));
                    } else {
                      callback();
                    }
                  }
                }
              ]
            },
            component: longitudinalPressureInput
          }
        ],
        textOptions: [
          {
            formItem: {
              prop: orderKeys.orderId,
              label: '订单编号'
            }
          },
          {
            formItem: {
              prop: orderKeys.materialSize,
              label: '下料规格'
            }
          },
          {
            formItem: {
              prop: orderKeys.linePressingMethod,
              label: '压线方式'
            }
          },
          {
            formItem: {
              prop: orderKeys.productAmount,
              label: '生产数量'
            }
          },
          {
            formItem: {
              prop: orderKeys.longitudinalPressure,
              label: '纵压公式'
            }
          },
        ],
        formData: {},
        defaultFormData: {}
      };
    },
    created() {
    },
    methods: {
      confirm() {
        console.log(this.formData);
        this.$refs.form.validate(()=>{
          if (!this.changeCheck()) {
            this.$message('页面信息没有变化', 'error');
            return;
          }
          let post = this.$method.cloneData([orderKeys.linePressingMethod, 'id'], {}, this.formData);
          post[orderKeys.longitudinalPressure] = this.formData[orderKeys.longitudinalPressure] && this.formData[orderKeys.longitudinalPressure].join('+');
          this.dj_api_extend(plannedMergerService.editLinePress, post).then(()=>{
            this.$emit('success');
            this.$message('调整压线成功');
            this.close();
          });
        });
      },
      open(param) {
        this.$refs.dialog.open();
        this.dj_api_extend(plannedMergerService.getOrderById, {id: param.id}).then(res => {
          let _res = res || {};
          let materialLength = res[orderKeys.materialLength];
          let materialWidth = res[orderKeys.materialWidth];
          if (materialLength && materialWidth) {
            _res[orderKeys.materialSize] = `${materialLength}*${materialWidth}`;
          }
          this.formData = _res;
        }).finally(this.saveDefaultData);
      },
      saveDefaultData() {
        this.defaultFormData = this.$method.deepClone(this.formData);
      },
      changeCheck() {
        let formKeys = this.formOptions.reduce((arr, obj) => {
          if (!(obj.attrs || {}).disabled && obj.type) {
            arr.push(obj.formItem.prop);
          }
          return arr;
        }, []);
        return !(formKeys.every(key => this.formData[key] === this.defaultFormData[key] || (['', undefined, null].includes(this.formData[key]) && ['', undefined, null].includes((this.defaultFormData || {})[key]))));
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
  .font-subhead {
    margin-top: 28px;
  }
</style>
