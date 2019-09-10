<template>
  <dj-dialog ref="dialog" @close="close" title="修改门幅" width="400px" @confirm="confirm">
    <dj-form ref="form" :formData="formData" :formOptions="formOptions"></dj-form>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
</template>
<script>
  import { orderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  import planArrangeService from "../../../api/service/planArrange";
  import productionLineService from "../../../api/service/productionLine";

  export default {
    name: 'editPaperSizeDialog',
    data: function () {
      return {
        formData: {},
        orders: [],
        lineId: undefined,
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
              keyMap: {
                value: paperKeys.paperSize,
                label: paperKeys.paperSize,
              },
              options: this.paperSize_arr
            }
          }
        ];
      }
    },
    created() {
    },
    methods: {
      getPaperSizeList() {
        this.dj_api_extend(productionLineService.list).then(res=>{
          let lineObj = (res.list || []).filter(obj=>this.lineId = obj.id)[0] || {};
          this.paperSize_arr = lineObj.linePaperSizeModels || [];
        });
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          let post = {
            ...this.formData,
            orderList: this.orders.length ? this.orders.map(obj=>obj[orderKeys.productionNo]) : null,
            lineId: this.lineId
          };
          this.dj_api_extend(planArrangeService.editPaperSize, post).then(()=>{
            this.$message('修改成功');
            this.$emit('success');
            this.close();
          }).finally(()=>{
            cb && cb();
          });
        }, cb);
      },
      open(params) {
        console.log(params);
        this.$refs.dialog.open();
        this.orders = params.data || [];
        this.lineId = params.lineId;
        this.getPaperSizeList();
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
