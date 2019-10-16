<template>
  <dj-dialog title="查看" ref="dialog" @close="close" :has-footer="false" width="1180px">
    <div class="content" v-loading="loading">
      <classify-form :form-data="formData" ref="form" :config="formConfig" :column-num="3"></classify-form>
    </div>
  </dj-dialog>
</template>

<script>
  import prodTaskService from '@/api/service/prodTask';
  import dayjs from 'dayjs'

  export default {
    name: 'prodTaskView',
    data() {
      return {
        formData: {},
        formConfig: [
          {
            title: '订单信息',
            hasLine: true,
            formOptions: [
              {formItem: {prop: 'produceOrderNumber', label: '生产编号：'}},
              {
                type: 'custom', isText: true, formItem: {prop: 'arriveTime', label: '订单交期：'},
                render: (h) => {
                  const time = this.formData.arriveTime;
                  if (time) {
                    return (
                      <span>{dayjs(time).format('YYYY-MM-DD')}</span>
                    );
                  }
                }
              },
              {formItem: {prop: 'customerName', label: '客户名称：'}},
              {formItem: {prop: 'sort', label: '订单排序：'}},
              {
                type: 'custom', isText: true, formItem: {prop: 'orderFlag', label: '订单标记：'},
                render: (h) => {
                  const flagMap = ['普通', '加急', '延期'];
                  let text = flagMap[this.formData.orderFlag] || '';
                  return (
                    <span>{text}</span>
                  );
                },
              },
            ]
          },
          {
            title: '产品信息',
            hasLine: true,
            formOptions: [
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
            title: '最终生产信息',
            hasLine: true,
            formOptions: [
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
            title: '原生产信息',
            hasLine: true,
            formOptions: [
              {formItem: {prop: 'calPaperSize_original', label: '最优门幅：'}},
              {formItem: {prop: 'cut_original', label: '切数：'}},
              {formItem: {prop: 'paperCount_original', label: '刀数：'}},
              {formItem: {prop: 'pieceAmount_original', label: '生产数量：'}},
              {formItem: {prop: 'vformula_original', label: '纵压公式：'}},
              {formItem: {prop: 'materialWidth_original', label: '切宽：'}},
              {formItem: {prop: 'paperLength_original', label: '订单米数：'}},
              {formItem: {prop: 'wasteWidth_original', label: '修边(mm)：'}},
              {formItem: {prop: 'wasteRate_original', label: '修边率：'}},
              // {formItem: {prop: 'stackFlag_original', label: '叠单标志：'}},
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
        this.dj_api_extend(prodTaskService.findDetailByProduceOrderNumber, {
          produceOrderNumber: id
        }).then(res => {
          res['arriveTime'] = this.$method.parseTime(res['arriveTime']);
          let _orderPlanOriginal = {};
          for (let item in res.orderPlanOriginal) {
            if (res.orderPlanOriginal.hasOwnProperty(item)) {
              _orderPlanOriginal[item + '_original'] = res.orderPlanOriginal[item];
            }
          }
          this.formData = Object.assign({}, res.produceTask, _orderPlanOriginal);
        }).finally(() => {
          this.loading = false;
        });
      },
      open(id) {
        this.$refs.dialog.open();
        this.getDetail(id);
      },
      initForm() {
        this.formConfig.map(v => v.formOptions.map(b => {
          this.formData[b.formItem.prop] = '';
        }));
      }
    },
    mounted() {
      this.initForm();
    }
  };
</script>
