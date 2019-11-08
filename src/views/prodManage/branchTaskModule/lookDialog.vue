<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm" title="处理" v-loading="dialogLoading">
    <classify-form ref="multiForm" :config="multiFormOptions" :column-num="2" :form-data="formData" v-loading="dialogLoading"></classify-form>
  </dj-dialog>
</template>
<script>
  import branchTaskService from '../../../api/service/branchTask';
  import {orderKeys} from "../../../utils/system/constant/dataKeys";

  export default {
    name: 'lookDialog',
    data () {
      const handleNum = (rule, value, callback) => {
        if (Number(value) === 0) {
          callback(new Error('处理数量不能为0'));
        }
        if (Number(value) > Number(this.formData.waitHandleNum)) {
          callback(new Error('处理数量不能大于待处理数量'));
        } else {
          callback();
        }
      };
      return {
        dialogLoading: false,
        formData: {},
        multiFormOptions: [
          {
            formOptions: [
              {
                type: 'input',
                formItem: {
                  prop: orderKeys.combineId,
                  label: '合并编号',
                },
                attrs: {
                  disabled: true,
                },
              },
              {
                type: 'input',
                formItem: {
                  prop: orderKeys.productionNo,
                  label: '生产编号',
                },
                attrs: {
                  disabled: true,
                },
              },
              {
                type: 'input',
                formItem: {
                  prop: 'waitHandleNum',
                  label: '待处理数量',
                },
                attrs: {
                  disabled: true,
                },
              },
              {
                type: 'input',
                formItem: {
                  prop: 'processeAmount',
                  label: '处理数量',
                  rules: [
                    this.$rule.required('请输入处理数量'),
                    this.$rule.number,
                    {validator: handleNum}
                  ],
                },
                attrs: {
                  maxlength: 10,
                  'is-auto-focus': true,
                },
              },
            ],
            columnNum: '2'
          },
          {
            title: '订单信息',
            formOptions: [
              {formItem: {prop: orderKeys.orderId, label: '订单编号'}},
              {formItem: {prop: orderKeys.orderAmount, label: '订单数量'}},
              {formItem: {prop: orderKeys.deliveryTime, label: '订单交期'}},
              {formItem: {prop: orderKeys.productName, label: '产品名称'}},
              {formItem: {prop: orderKeys.customerName, label: '客户名称'}},
              {formItem: {prop: orderKeys.productSize, label: '产品规格'}},
              {formItem: {prop: orderKeys.materialCode, label: '用料代码'}},
              {formItem: {prop: 'fluteTypeAndLayers', label: '瓦楞楞型'}},
              {formItem: {prop: orderKeys.materialSize, label: '下料规格'}},
              {formItem: {prop: orderKeys.linePressingMethod, label: '压线方式'}},
              {formItem: {prop: orderKeys.transversePressure, label: '横压公式'}},
              {formItem: {prop: orderKeys.longitudinalPressure, label: '纵压公式'}},
            ],
            columnNum: '2'
          }
        ],
      };
    },
    methods: {
      open(row) {
        this.dialogLoading = true;
        this.getDivideMsg(row.id);
        this.$refs.dialog.open();
      },
      confirm() {
        this.$refs.multiForm.$refs.form[0].validate((valid) => {
          if (valid) {
            this.dialogLoading = true;
            let {id, processeAmount, divideState} = this.formData;
            processeAmount = processeAmount.replace(/^[0]*/g, '');
            this.dj_api_extend(branchTaskService.processe, {
              id: id,
              processeAmount: processeAmount,
              divideState: divideState,
            }).then(() => {
              this.$message('处理成功', 'success');
              this.$emit('confirm');
              this.close();
            }).finally(() => {
              this.dialogLoading = false;
            });
          }
        });
      },
      getDivideMsg(id) {
        this.dj_api_extend(branchTaskService.getDivideMsg, {
          id: id
        }).then(res => {
          res.waitHandleNum = res[orderKeys.orderAmount] - res.processeAmount;
          res.processeAmount = '';
          this.formData = res;
        }).then(() => {
          this.dialogLoading = false;
        });
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
    }
  };
</script>
<style lang="less" scoped>
</style>
