<template>
  <dj-dialog ref="dialog" @close="close" width="780px" title="更换生产线" @confirm="confirm">
    <div v-loading="isLoading">
      <dj-form ref="form" :formData="formData" :formOptions="formOptions" :column-num="2" :col-rule="colRule"></dj-form>
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
      console.log(this);
      // this.allData = [
      //   {
      //     label: '1',
      //     value: '1',
      //     paperSize: 1800,
      //     children: [
      //       {
      //         label: '1-1',
      //         value: '1-1',
      //         meters: 100,
      //         materialCode: 'HZ1X',
      //       },
      //       {
      //         label: '1-2',
      //         value: '1-2',
      //         meters: 200,
      //         materialCode: 'HZ1X',
      //       },
      //       {
      //         label: '1-3',
      //         value: '1-3',
      //         meters: 300,
      //         materialCode: 'HZ1X',
      //       }
      //     ]
      //   },
      //   {
      //     label: '2',
      //     value: '2',
      //     paperSize: 2000,
      //     children: [
      //       {
      //         label: '2-1',
      //         value: '2-1',
      //         meters: 50,
      //         materialCode: 'X3',
      //       },
      //       {
      //         label: '2-2',
      //         value: '2-2',
      //         meters: 123,
      //         materialCode: '1X',
      //       },
      //       {
      //         label: '2-3',
      //         value: '2-3',
      //         meters: 64,
      //         materialCode: 'Z1',
      //       }
      //     ]
      //   },
      // ];
      this.getAllLine();
    },
    methods: {
      colRule(item) {
        if (item.formItem.prop === 'list') {
          return 24;
        }
        return 12;
      },
      // renderContent(h, option) {
      //   console.log(option);
      //   return (
      //     <el-tree data={[option]}></el-tree>
      //   );
      // },
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
        console.log(this.formData);
        this.$refs.form.validate(()=>{
          let post ={
            ...this.formData,
            oldLine: this.oldLine,
            changeList: this.formData.list && this.formData.list.reduce((arr, obj)=>{
              obj.children && obj.children.forEach(child=>{
                arr.push({
                  paperSize: obj.paperSize,
                  produceMaterialId: child[orderKeys.produceMaterialId]
                });
              });
              return arr;
            }, [])
          };
          this.dj_api_extend(planArrangeService.changeProdLine, post).then(res=>{
            this.$message('更换成功');
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
        this.dj_api_extend(planArrangeService.integratedMaterial, {lineId: this.oldLine, orderList: this.orders}).then((res = {})=>{
          this.allData = Object.keys(res).map(key=>{
            if (Array.isArray(res[key])) {
              res[key].map(obj=>{
                obj.value = `${key}+${obj[orderKeys.orderMetres]}`
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
    .el-col:nth-last-of-type(1) .el-form-item__content{
      margin-left: 60px !important;
    }
  }
</style>
