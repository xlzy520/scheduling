<template>
  <dj-dialog ref="dialog" @close="close" width="400px" title="叠单标记" @confirm="confirm">
    <classify-form ref="form" :form-data="formData" :config="config"></classify-form>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
</template>
<script>
  import {orderKeys} from "../../../utils/system/constant/dataKeys";
  import planArrangeService from '../../../api/service/planArrange';
  export default {
    name: 'editStackDialog',
    data: function () {
      return {
        formData: {},
        lineId: undefined
      };
    },
    computed: {
      config() {
        return [
          {
            formOptions: [
              {
                type: 'select',
                formItem: {
                  prop: orderKeys.stackUp,
                  label: '叠单标记'
                },
                attrs: {
                  default: null,
                  options: this.$enum.stackUpTip._arr
                }
              },
            ]
          }
        ];
      }
    },
    created() {
    },
    methods: {
      getOrderMsg(params) {
        this.dj_api_extend(planArrangeService.getOrder, params).then(res => {
          if (res[orderKeys.stackUp] + '' === '0') {
            res[orderKeys.stackUp] = null;
          }
          this.formData = res || {};
        });
      },
      confirm(cb) {
        this.$refs.form.validate(() => {
          let post = {
            ...this.$method.getFormDataChangeableValue(this.formData, this.config),
            order: this.formData[orderKeys.productionNo]
          };
          this.dj_api_extend(planArrangeService.editStack, post).then(() => {
            this.$emit('success');
            this.$message('编辑成功');
            this.close();
          }).finally(() => {
            cb && cb();
          });
        }, cb);
      },
      open(param = {}) {
        this.$refs.dialog.open();
        this.lineId = param.lineId;
        this.getOrderMsg(param.data);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
  };
</script>
