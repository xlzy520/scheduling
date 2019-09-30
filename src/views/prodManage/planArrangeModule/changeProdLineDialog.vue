<template>
  <dj-dialog ref="dialog" @close="close" width="780px" title="更换生产线" @confirm="confirm">
    <div v-loading="isLoading">
      <dj-form ref="form" :form-data="formData" :form-options="formOptions" :column-num="2" :col-rule="colRule"></dj-form>
    </div>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
</template>
<script>
  import productionLineService from '../../../api/service/productionLine';
  import planArrangeService from '../../../api/service/planArrange';
  import prodTransfer from './common/prodTransfer';
  import {orderKeys} from "../../../utils/system/constant/dataKeys";

  export default {
    name: 'changeProdLineDialog',
    data: function () {
      return {
        allData: [],
        checkedData: [],
        formData: {},
        prodLine_arr: [],
        oldLine: undefined,
        orders: [],
        isEdit: false,
        isLoading: false
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'select',
            formItem: {
              prop: 'newLine',
              label: '生产线',
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback(new Error('请选择生产线'));
                    } else {
                      callback();
                    }
                  }
                }
              ]
            },
            attrs: {
              keyMap: {
                // label: 'lineNum',
                // value: 'lineNum'
              },
              options: this.prodLine_arr
            }
          },
          {
            type: 'custom',
            formItem: {
              prop: 'list',
              // label: '生产线',
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value || !value.length) {
                      callback(new Error('请选择订单'));
                    } else {
                      callback();
                    }
                  },
                  // trigger: 'input'
                }
              ]
            },
            attrs: {
              data: this.allData
            },
            component: prodTransfer
          },
        ];
      }
    },
    created() {
      this.getAllLine();
    },
    methods: {
      colRule(item) {
        if (item.formItem.prop === 'list') {
          return 24;
        }
        return 12;
      },
      calcMeters(arr = [], keyMap, sum = 0) {
        arr.forEach(obj=>{
          let children = obj[keyMap.childKey];
          if (Array.isArray(children) && children.length) {
            sum = this.calcMeters(children, keyMap, sum);
          } else {
            sum += Number(obj['paperLength']);
          }
        });
        return sum;
      },
      change() {},
      getAllLine() {
        this.dj_api_extend(productionLineService.list).then(res => {
          this.prodLine_arr = (res.list || []).filter(obj=>obj.isEffected && obj.id !== this.oldLine).map(obj => {
            obj.label = obj['lineNum'] + '号线';
            obj.value = obj['id'];
            return obj;
          });
        });
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          let post = {
            // ...this.formData,
            oldLine: this.oldLine,
            newLine: this.formData.newLine,
            changeList: this.formData.list && this.formData.list.reduce((arr, obj)=>{
              obj.children && obj.children.forEach(child=>{
                arr.push(...child['produceId']);
                // arr.push({
                //   paperSize: obj.paperSize,
                //   produceMaterialId: child[orderKeys.produceMaterialId]
                // });
              });
              return arr;
            }, [])
          };
          this.dj_api_extend(planArrangeService.changeProdLine, post).then(()=>{
            this.$message('更换成功');
            this.$emit('success');
            this.close();
          }).catch(()=>{
            this.$emit('success');
            this.close();
          }).finally(cb);
        }, cb);
      },
      open(param = {}) {
        this.$refs.dialog.open();
        this.isLoading = true;
        this.oldLine = param.lineId;
        this.orders = param.data || [];
        this.dj_api_extend(planArrangeService.integratedMaterial, {lineId: this.oldLine, orderList: this.$method.getOrderList(this.orders)}).then((res = {})=>{
          this.allData = Object.keys(res).map(key=>{
            if (Array.isArray(res[key])) {
              res[key].map(obj=>{
                obj.value = `${key}+${obj[orderKeys.orderMetres]}`;
              });
            }
            return {
              value: key,
              paperSize: key,
              children: res[key]
            };
          });
        }).finally(()=>{
          this.isLoading = false;
        });
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
  };
</script>
<style lang="less" scoped>
  .dj-form /deep/ .el-row {
    .el-form-item.is-error .el-transfer-panel {
      border-color: red;
    }
    .el-form-item.is-success .el-transfer-panel {
      border-color: #40b317;
    }
    .el-col:nth-last-of-type(1) .el-form-item__content {
      margin-left: 60px !important;
    }
  }
</style>
