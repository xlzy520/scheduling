<template>
  <dj-dialog ref="dialog" @close="close" title="调整排序" width="400px" @confirm="confirm">
    <dj-form ref="form" :formData="formData" :formOptions="formOptions"></dj-form>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
</template>
<script>
  import { orderKeys } from "../../../utils/system/constant/dataKeys";
  import planArrangeService from "../../../api/service/planArrange";

  export default {
    name: 'changeSortDialog',
    data: function () {
      return {
        formData: {},
        orders: [],
        lineId: undefined
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'input',
            formItem: {
              prop: 'newPosition',
              label: '订单排序',
              rules: [
                {
                  validator(rule, value, cb) {
                    if (!value) {
                      cb(new Error('请输入订单排序'));
                    } else {
                      cb();
                    }
                  }
                },
                this.$rule.orderSort_range
              ]
            }
          }
        ];
      }
    },
    methods: {
      confirm(cb) {
        this.$refs.form.validate(()=>{
          let post = {
            ...this.formData,
            lineId: this.lineId,
            orderList: this.orders.length ? this.orders.map(obj=>obj[orderKeys.productionNo]) : null
          };
          this.dj_api_extend(planArrangeService.changeSort, post).then(()=>{
            this.$message('调整排序成功');
            this.$emit('success');
            this.close();
          }).finally(()=>{
            cb && cb();
          });
        }, cb);
      },
      open(params) {
        this.$refs.dialog.open();
        this.orders = params.data || [];
        this.lineId = params.lineId || [];
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
  };
</script>
<style lang="less" scoped>

</style>
