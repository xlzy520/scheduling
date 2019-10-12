<template>
  <dj-dialog ref="dialog" @close="confirmClose" width="400px" title="编辑" @confirm="confirm">
    <dj-form v-loading="isLoading" ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
</template>
<script>
  import {orderKeys} from '../../../utils/system/constant/dataKeys';
  import materialSizeInput from '../../../components/materialSizeInput';
  import plannedMergerService from "../../../api/service/plannedMerger";
  export default {
    name: 'editDialog',
    data: function () {
      return {
        formOptions: [
          {
            type: 'input',
            formItem: {
              prop: orderKeys.orderAmount,
              label: '订单数量',
              rules: [
                {pattern: /^\d+$/, message: '请输入正整数'},
                {
                  validator: (rule, value, callback) => {
                    if (!(value && Number(value) <= 999999 && Number(value) >= 1)) {
                      callback(new Error('请输入范围1~999999'));
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
              prop: this.$method.getOriginKey(orderKeys.orderAmount),
              label: '原订单数量:',
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
                    if (!(value && value[0] && value[1] && Number(value[0]) <= 9999 && Number(value[0]) >= Number(this.formData[this.$method.getOriginKey(orderKeys.materialLength)]) && Number(value[1]) <= 9999 && Number(value[1]) >= Number(this.formData[this.$method.getOriginKey(orderKeys.materialWidth)]))) {
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
              prop: this.$method.getOriginKey(orderKeys.materialSize),
              label: '原下料规格:'
            },
          },
        ],
        formData: {},
        defaultFormData: {},
        isLoading: false
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
        return !(formKeys.every(key => {
          if (key === orderKeys.materialSize) {
            return (['', undefined, null].includes(this.formData[key]) && ['', undefined, null].includes((this.defaultFormData || {})[key])) || this.defaultFormData[key].join('*') === this.formData[key].join('*');
          } else {
            return this.formData[key] === this.defaultFormData[key] || (['', undefined, null].includes(this.formData[key]) && ['', undefined, null].includes((this.defaultFormData || {})[key]));
          }
        }));
      },
      confirmClose() {
        if (this.changeCheck()) {
          this.$method.tipBox('信息未保存，确认是否关闭？', this.close);
          // this.$confirm('信息未保存，确认是否关闭？', '', {
          //   type: 'warning',
          //   showClose: false,
          // }).then(() => {
          //   this.close();
          // });
        } else {
          this.close();
        }
      },
      confirm(cb) {
        this.$refs.form.validate(() => {
          if (!this.changeCheck()) {
            this.$message('页面信息没有变化', 'error');
            cb();
            return;
          }
          let post = {
            ...(this.$method.cloneData([orderKeys.productionNo, orderKeys.orderAmount], {}, this.formData)),
          };
          let materialSize = this.formData[orderKeys.materialSize] || [];
          post[orderKeys.materialLength] = materialSize[0];
          post[orderKeys.materialWidth] = materialSize[1];
          this.dj_api_extend(plannedMergerService.edit, post).then(() => {
            this.$emit('success');
            this.$message('编辑成功');
            this.close();
          }).finally(cb);
        }, cb);
      },
      getOrderById(post) {
        return this.dj_api_extend(plannedMergerService.getOrderById, post).then(({ main }) => {
          main[orderKeys.materialSize] = this.$method.getMaterialSize(main, true);
          return main;
        });
      },
      getModifyOrder(params) {
        return this.dj_api_extend(plannedMergerService.getModifyOrder, params);
      },
      open(param) {
        this.$refs.dialog.open();
        let post = this.$method.cloneData([orderKeys.productionNo], {}, param);
        this.isLoading = true;
        Promise.all([this.getOrderById(post), this.getModifyOrder(post)]).then(result=>{
          this.formData = {...result[1], ...result[0]};
        }).finally(()=>{
          this.isLoading = false;
          this.saveDefaultData();
        });
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    }
  };
</script>
