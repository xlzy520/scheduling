<template>
  <dj-dialog ref="dialog" @close="confirmClose" width="400px" title="编辑" @confirm="confirm">
    <dj-form ref="form" :formData="formData" :formOptions="formOptions"></dj-form>
  </dj-dialog>
</template>
<script>
  import {djForm} from 'djweb';
  import {orderKeys} from '../../../utils/system/constant/dataKeys';
  import materialSizeInput from '../../../components/materialSizeInput';
  import plannedMergerService from "../../../api/service/plannedMerger";

  const {rules} = djForm;
  export default {
    name: 'editDialog',
    data: function () {
      return {
        formOptions: [
          {
            type: 'input',
            formItem: {
              prop: orderKeys.productAmount,
              label: '生产数量',
              rules: [
                {pattern: /^\d+$/, message: '请输入正整数'},
                {
                  validator: (rule, value, callback) => {
                    if (!(value && Number(value) < 999999 && Number(value) > Number(this.formData['oldProductAmount']))) {
                      callback(new Error('请输入范围原订单数量~999999'));
                    } else {
                      callback();
                    }
                  }
                },
              ]
            },
          },
          {
            formItem: {
              prop: 'oldProductAmount',
              label: '原生产数量:',
            },
          },
          {
            type: 'custom',
            formItem: {
              prop: orderKeys.materialSize,
              label: '下料规格',
              rules: [
                {
                  validator: (rule, value, callback) => {
                    let reg = this.$reg.getFloatReg(1);
                    if (!(value && value[0] && value[1] && reg.test(value[0]) && reg.test(value[1]))) {
                      callback(new Error('请输入正数、一位小数'));
                    } else {
                      callback();
                    }
                  }
                },
                {
                  validator: (rule, value, callback) => {
                    if (!(value && value[0] && value[1] && Number(value[0]) < 9999 && Number(value[0]) > Number(this.formData[orderKeys.materialLength]) && Number(value[1]) < 9999 && Number(value[1]) > Number(this.formData[orderKeys.materialWidth]))) {
                      callback(new Error('请输入范围原订单规格~9999'));
                    } else {
                      callback();
                    }
                  }
                },
              ]
            },
            component: materialSizeInput
          },
          {
            formItem: {
              prop: 'oldMaterialSize',
              label: '原下料规格:'
            },
          },
        ],
        formData: {},
        defaultFormData: {}
      };
    },
    created() {
    },
    methods: {
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
      confirm() {
        this.$refs.form.validate(() => {
          if (!this.changeCheck()) {
            this.$message('页面信息没有变化', 'error');
            return;
          }
          let post = {
            ...this.formData
          };
          let materialSize = this.formData[orderKeys.materialSize] || [];
          post[orderKeys.materialLength] = materialSize[0];
          post[orderKeys.materialWidth] = materialSize[1];
          this.dj_api_extend(plannedMergerService.edit, post).then(() => {
            this.$emit('success');
            this.$message('编辑成功');
            this.close();
          })
        });
      },
      open(param) {
        this.$refs.dialog.open();
        this.dj_api_extend(plannedMergerService.getOrderById, {id: param.id}).then(res => {
          let _res = res || {};
          _res[orderKeys.materialSize] = [res[orderKeys.materialLength], res[orderKeys.materialWidth]];
          this.formData = _res;
        }).finally(this.saveDefaultData);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    }
  };
</script>
