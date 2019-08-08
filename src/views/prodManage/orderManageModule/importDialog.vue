<template>
  <dj-dialog ref="dialog" @close="close" title="导入计划" width="480px" @confirm="confirm">
    <dj-form v-show="!importing" ref="form" :formData="formData" :formOptions="formOptions"></dj-form>
    <div v-show="importing" class="progress-wrap">
      <auto-progress ref="progress" :trickleSpeed="1000"></auto-progress>
      <p>正在导入订单</p>
    </div>
    <div v-if="importing" slot="footer"></div>
  </dj-dialog>
</template>
<script>
  import autoProgress from '../../../components/autoProgress';
  import productionLineService from '../../../api/service/productionLine';
  export default {
    name: 'importDialog',
    data: function () {
      return {
        formOptions: [
          {
            type: 'custom',
            formItem: {
              prop: 'prodLine',
              label: '生产线'
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
                let select = h('dj-select', {props: {value: this.value, options: this.prodLine_arr, ...this.$attrs, label: '生产线'}, on: {input}});
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
      };
    },
    created() {
      this.getAllLine();
    },
    methods: {
      confirm() {
        this.$refs.form.validate(()=>{
          //todo 发送新增订单接口
          console.log('addOrder');
          this.importing = true;
          this.$refs.progress.start();
          setTimeout(()=>{
            this.$refs.progress.done(this.close);
          }, Math.random()*5000);
        });
      },
      getAllLine() {
        this.dj_api_extend(productionLineService.list, {pageNo: 1, pageSize: 9999999}).then(res=>{
          this.prodLine_arr = res.list || [];
        });
      },
      open(orders) {
        console.log(orders);
        this.$refs.dialog.open();
        if (orders === true) {
          this.isImportAll = true;
        } else {
          this.orders = orders;
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
    overflow: hidden;
    margin-top: 10px;
    text-align: center;
    p {
      margin-top: 10px;
    }
  }
</style>
