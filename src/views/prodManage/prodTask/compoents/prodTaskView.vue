<template>
  <dj-dialog title="查看" ref="dialog" @close="close" :hasFooter="false">
    <div class="content" v-loading="loading">
      <div class="item" v-for="form in formOptions">
        <div>{{form.label}}</div>
        <dj-form :form-data="formData" ref="form" :form-options="form.formBlock" :column-num="3"></dj-form>
      </div>
    </div>
  </dj-dialog>
</template>

<script>
  import {djForm} from 'djweb';
  import formRules from "../../../baseSetting/formRules";
  import prodTaskService from '@/api/service/prodTask';

  export default {
    name: 'prodTaskView',
    data() {
      return {
        formData: {},
        formOptions: [
          {
            label: '订单信息',
            formBlock: [
              {formItem: {prop: 'produceOrderNumber', label: '生产编号：'}},
              {formItem: {prop: 'arriveTime', label: '订单交期：'}},
              {formItem: {prop: 'customerName', label: '客户名称：'}},
              {formItem: {prop: 'sort', label: '订单排序：'}},
              {
                type: 'custom', isText: true, formItem: {prop: 'orderFlag', label: '订单标记：'},
                render: (h) => {
                  const flagMap = ['正常订单', '急单', '延期订单'];
                  let text = flagMap[this.formData.orderFlag] || '';
                  return (
                    <span>{text}</span>
                  );
                },
              },
            ]
          },
          {
            label: '产品信息',
            formBlock: [
              {formItem: {prop: 'grouponProductName', label: '产品名称：'}},
              {formItem: {prop: 'pieceAmount', label: '订单数量：'}},
              {formItem: {prop: 'materialCode', label: '用料代码：'}},
              {formItem: {prop: 'tileModel', label: '瓦楞楞型：'}},
              {
                type: 'custom', isText: true, formItem: {prop: 'chanpingguige', label: '产品规格：'},
                render: (h) => {
                  if (this.formData.productLength || this.formData.productLength === 0) {
                    return (
                      <span>{this.formData.productLength + '*' + this.formData.productWidth + '*' + this.formData.productHeight}</span>
                    );
                  }
                },
              },
              {
                type: 'custom', isText: true, formItem: {prop: 'xialiaoguige', label: '下料规格：'},
                render: (h) => {
                  return (
                    <span>{this.formData.materialLength + '*' + this.formData.materialWidth}</span>
                  );
                },
              },
              {formItem: {prop: 'staveType', label: '压线方式：'}},
              {formItem: {prop: 'hformula', label: '横压公式：'}},
            ]
          },
          {
            label: '最终生产信息',
            formBlock: [
              {formItem: {prop: 'paperSize', label: '最优门幅：'}},
              {formItem: {prop: 'cutCount', label: '切数：'}},
              {formItem: {prop: 'knifeCount', label: '刀数：'}},
              {formItem: {prop: 'produceAmount', label: '生产数量：'}},
              {formItem: {prop: 'vformula', label: '纵压公式：'}},
              {formItem: {prop: 'materialWidth', label: '切宽：'}},
              {formItem: {prop: 'orderMeter', label: '订单米数：'}},
              {formItem: {prop: 'trimming', label: '修边(mm)：'}},
              {formItem: {prop: 'trimmingRate', label: '修边率：'}},
              {formItem: {prop: 'stackFlag', label: '叠单标志：'}},
            ]
          },
          {
            label: '原生产信息',
            formBlock: [
              {formItem: {prop: 'sourcePaperSize', label: '最优门幅：'}},
              {formItem: {prop: 'cutCount', label: '切数：'}},
              {formItem: {prop: 'knifeCount', label: '刀数：'}},
              {formItem: {prop: 'produceAmount', label: '生产数量：'}},
              {formItem: {prop: 'sourceVformula', label: '纵压公式：'}},
              {formItem: {prop: 'sourceMaterialWidth', label: '切宽：'}},
              {formItem: {prop: 'orderMeter', label: '订单米数：'}},
              {formItem: {prop: 'sourceTrimming', label: '修边(mm)：'}},
              {formItem: {prop: 'sourceTrimmingRate', label: '修边率：'}},
              {formItem: {prop: 'stackFlag', label: '叠单标志：'}},
            ]
          },
        ],
        loading: false
      };
    },
    methods: {
      close() {
        this.formData = {};
        this.$emit('close');
      },
      getDetail(id) {
        this.loading = true;
        this.dj_api_extend(prodTaskService.findByProduceOrderNumber, {
          produceOrderNumber: id
        }).then(res => {
          this.formData = res;
        }).finally(() => {
          this.loading = false;
        });
      },
      open(id) {
        this.$refs.dialog.open();
        this.getDetail(id);
      },
      initForm() {
        this.formOptions.map(v => v.formBlock.map(b => {
          this.formData[b.formItem.prop] = '';
        }));
      }
    },
    mounted() {
      this.initForm();
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .content {
    width: 1140px;

    .item {
      border-bottom: 1px solid #EBEEF5;
      margin-top: 20px;
      padding-bottom: 16px;
    }

    @{deep} .dj-form {
      .el-form-item {
        margin-bottom: 0;
        margin-top: 0;
      }
    }
  }
</style>
