<template>
    <dj-dialog ref="dialog" @close="close" width="780px" title="编辑" @confirm="confirm">
        <classify-form ref="form" :formData="formData" :config="config" :column-num="2" :col-rule="colRule"></classify-form>
    </dj-dialog>
</template>
<script>
  import {orderKeys} from "../../../utils/system/constant/dataKeys";
  import planArrangeService from '../../../api/service/planArrange'
  export default {
    name: 'editDialog',
    data: function () {
      return {
        config: [
          {
            formOptions: [
              {
                type: 'select',
                formItem: {
                  prop: orderKeys.optimalSize,
                  label: '最优门幅'
                },
              },
              {
                type: 'select',
                formItem: {
                  prop: orderKeys.cutNumber,
                  label: '订单切数'
                },
                attrs: {
                  bindObject: true,
                  options: this.$enum.orderCutNumber
                }
              },
              {
                formItem: {
                  prop: 'origin'+ orderKeys.optimalSize,
                  label: '原最优门幅'
                },
              },
              {
                formItem: {
                  prop: 'origin' + orderKeys.cutNumber,
                  label: '原订单切数'
                },
              },
              {
                type: 'select',
                formItem: {
                  prop: orderKeys.stackUp,
                  label: '叠单标记'
                },
                attrs: {
                  options: this.$enum.stackUpTip._arr
                }
              },
              {
                formItem: {
                  prop: 'origin' + orderKeys.stackUp,
                  label: '原叠单标记'
                },
              },
            ]
          }
        ],
        formData: {},
      };
    },
    created() {
    },
    methods: {
      colRule(item) {
        let prop = item.formItem.prop;
        if (prop === orderKeys.stackUp) {
          return 24;
        }
        return 12;
      },
      getOrderMsg(params) {
        this.dj_api_extend(planArrangeService.getOrder, params).then(res=>{
          this.formData = res || {};
        });
      },
      confirm(cb) {
        console.log(this.formData);
        this.$refs.form.validate(()=>{
          this.dj_api_extend(planArrangeService.editOrder, this.formData).then(()=>{
            this.$emit('success');
            this.$message('编辑成功');
            this.close();
          }).finally(()=>{
            cb && cb();
          })
        });
      },
      open(param) {
        this.$refs.dialog.open();
        this.getOrderMsg(param);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
  };
</script>
