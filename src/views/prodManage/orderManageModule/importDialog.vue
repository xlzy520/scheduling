<template>
  <dj-dialog ref="dialog" @close="close" title="导入计划" width="400px" @confirm="confirm">
    <dj-form v-show="!importing" ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
    <div v-show="importing" class="progress-wrap">
      <auto-progress ref="progress" :trickle-speed="1000"></auto-progress>
      <p>正在导入订单</p>
    </div>
    <div v-if="importing" slot="footer"></div>
  </dj-dialog>
</template>
<script>
  import autoProgress from '../../../components/autoProgress';
  import productionLineService from '../../../api/service/productionLine';
  import orderManageService from '../../../api/service/orderManage';
  import { orderKeys } from "../../../utils/system/constant/dataKeys";

  export default {
    name: 'importDialog',
    data: function () {
      return {
        formOptions: [
          {
            type: 'custom',
            formItem: {
              prop: 'lineId',
              label: '生产线',
              rules: [this.$rule.required('请选择生产线')]
            },
            component: {
              computed: {
                orders: () => {
                  return this.orders;
                },
                isImportAll: () => {
                  return this.isImportAll;
                },
                prodLine_arr: () => {
                  return this.prodLine_arr;
                }
              },
              props: ['value'],
              render(h) {
                const input = (val) => {
                  this.$emit('input', val);
                };
                let select = h('dj-select', {props: {value: this.value, options: this.prodLine_arr, ...this.$attrs, label: '生产线', keyMap: {value: 'id'}}, on: {input}});
                return (
                  <div>
                    {select}
                    <p class="tip">{ this.isImportAll ? '确认导入所有订单进入生产计划?' : `确认导入所选${this.orders.length}条订单进入生产计划?` }</p>
                  </div>
                );
              }
            }
          }
        ],
        formData: {},
        orders: [],
        prodLine_arr: [],
        isImportAll: false,
        importing: false,
        searchData: {}
      };
    },
    created() {
      this.getAllLine();
    },
    methods: {
      confirm() {
        this.$refs.form.validate(()=>{
          this.importing = true;
          this.$refs.progress.start();
          let api;
          let post = {
            ...this.formData,
          };
          if (this.isImportAll) {
            api = orderManageService.importAllOrder;
            Object.assign(post, this.searchData);
          } else {
            api = orderManageService.importOrder;
            post.orderList = this.$method.getOrderList(this.orders);
          }
          this.dj_api_extend(api, post).then(()=>{
            this.$refs.progress.done(()=>{
              this.$message('导入成功');
              this.$emit('success');
              this.close();
            });
          }).catch(()=>{
            this.$refs.progress.done(()=>{
              this.$emit('success');
              this.close();
            });
          });
        });
      },
      getAllLine() {
        this.dj_api_extend(productionLineService.list).then(res=>{
          this.prodLine_arr = (res.list || []).filter(obj=>obj.isEffected).map(obj=>{
            obj.label = obj['lineNum'] + '号线';
            return obj;
          });
        });
      },
      open(params) {
        this.$refs.dialog.open();
        if (Array.isArray(params)) {
          this.orders = params;
        } else {
          this.searchData = params;
          this.isImportAll = true;
        }
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
    components: {
      autoProgress
    }
  };
</script>
<style lang="less" scoped>
  /deep/ .tip {
    font-size: 12px;
    color: #c2c6d1;
  }
  .progress-wrap {
    margin-top: 10px;
    overflow: hidden;
    text-align: center;
    p {
      margin-top: 10px;
    }
  }
</style>
