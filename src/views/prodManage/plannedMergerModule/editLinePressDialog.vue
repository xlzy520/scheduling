<template>
  <dj-dialog ref="dialog" @close="confirmClose" width="780px" title="调整压线方式" @confirm="confirm">
    <div v-loading="isLoading">
      <classify-form ref="form" :config="config" :form-data="formData" :column-num="2" :col-rule="colRule"></classify-form>
      <!--<dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>-->
      <!--<p class="font-subhead">原订单信息</p>-->
      <!--<dj-form labelSuffix=":" :form-data="formData" :form-options="textOptions" :column-num="2"></dj-form>-->
    </div>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
</template>
<script>
  import plannedMergerService from '../../../api/service/plannedMerger';
  import longitudinalPressureInput from '../../../components/longitudinalPressureInput';
  import {orderKeys} from "../../../utils/system/constant/dataKeys";
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
                this.$rule.vformula_range,
                // {validator: checkValue},
                {
                  validator: (rule, value, callback) => {
                    let materialWidth = this.formData[orderKeys.materialWidth];
                    if (value && value.length) {
                      let sum = value.reduce((sum, cur) => {
                        sum += Number(cur || 0);
                        return sum;
                      }, 0);
                      if (Number(materialWidth) !== sum && sum !== 0) {
                        callback(new Error('请检查纵压公式'));
                      } else {
                        callback();
                      }
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
              prop: 'originalProduceOrderNumber',
              label: '生产编号'
            }
          },
          {
            formItem: {
              prop: 'originalMaterialSize',
              label: '下料规格'
            }
          },
          {
            formItem: {
              prop: 'originalStaveType',
              label: '压线方式'
            }
          },
          {
            formItem: {
              prop: 'originalVFormula',
              label: '纵压公式'
            }
          },
        ],
        formData: {},
        defaultFormData: {},
        isLoading: false,
      };
    },
    computed: {
      config() {
        return [
          {
            formOptions: this.formOptions
          },
          {
            title: '原订单信息',
            formOptions: this.textOptions
          },
        ];
      }
    },
    created() {
    },
    methods: {
      colRule(item) {
        if ([orderKeys.longitudinalPressure, orderKeys.linePressingMethod].includes(item.formItem.prop)) {
          return 24;
        }
        return 12;
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          if (!this.changeCheck()) {
            this.$message('页面信息没有变化', 'error');
            cb();
            return;
          }
          let post = {
            ...this.formData,
          };
          post[orderKeys.longitudinalPressure] = this.formData[orderKeys.longitudinalPressure] && this.formData[orderKeys.longitudinalPressure].filter(val=>!['', null, undefined].includes(val)).join('+');
          this.dj_api_extend(plannedMergerService.editLinePress, post).then(()=>{
            this.$emit('success');
            this.$message('调整压线成功');
            this.close();
          }).finally(cb);
        }, cb);
      },
      open(param) {
        this.$refs.dialog.open();
        let post = this.$method.cloneData([orderKeys.productionNo], {}, param);
        this.isLoading = true;
        Promise.all([this.getOrderById(post), this.getOriginalPressLine(post)]).then(result=>{
          this.formData = {...result[1], ...result[0]};
        }).finally(()=>{
          this.isLoading = false;
          this.saveDefaultData();
        });
      },
      getOrderById(post) {
        return this.dj_api_extend(plannedMergerService.getOrderById, post).then(({ main }) => {
          let longitudinalPressure = main[orderKeys.longitudinalPressure];
          main[orderKeys.longitudinalPressure] = longitudinalPressure ? longitudinalPressure.split('+') : [];
          return main;
        });
      },
      getOriginalPressLine(params) {
        return this.dj_api_extend(plannedMergerService.getOriginalPressLine, params);
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
        return !(formKeys.every(key => {
          if (key === orderKeys.longitudinalPressure) {
            return this.defaultFormData[key].join('+') === this.formData[key].join('+');
          } else {
            return this.formData[key] === this.defaultFormData[key] || (['', undefined, null].includes(this.formData[key]) && ['', undefined, null].includes((this.defaultFormData || {})[key]));
          }
        }));
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
