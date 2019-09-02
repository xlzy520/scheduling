<template>
  <dj-dialog ref="dialog" @close="close" title="修改门幅" width="400px" @confirm="confirm">
    <dj-form ref="form" :formData="formData" :formOptions="formOptions"></dj-form>
  </dj-dialog>
</template>
<script>
  import { orderKeys } from "../../../utils/system/constant/dataKeys";
  import planArrangeService from "../../../api/service/planArrange";

  export default {
    name: 'editPaperSizeDialog',
    data: function () {
      return {
        formData: {},
        orders: [],
        paperSize_arr: [],
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'select',
            formItem: {
              prop: orderKeys.optimalSize,
              label: '最优门幅',
              rules: [
                {
                  validator(rule, value, cb) {
                    if (!value) {
                      cb(new Error('请选择最优门幅'));
                    } else {
                      cb();
                    }
                  }
                }
              ]
            },
            attrs: {
              options: this.paperSize_arr
            }
          }
        ];
      }
    },
    created() {
      this.getPaperSizeList();
    },
    methods: {
      getPaperSizeList() {
        this.dj_api_extend(planArrangeService.getPaperSizeList).then(res=>{
          this.paperSize_arr = res.list || [];
        });
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          let post = {
            ...this.formData,
            orderList: this.orders.length ? this.orders.map(obj=>obj[orderKeys.productionNo]) : null
          };
          this.dj_api_extend(planArrangeService.editPaperSize, post).then(()=>{
            this.$message('修改成功');
            this.$emit('success');
            this.close();
          }).finally(()=>{
            cb && cb();
          });
        });
      },
      open(orders) {
        this.$refs.dialog.open();
        this.orders = orders || [];
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
