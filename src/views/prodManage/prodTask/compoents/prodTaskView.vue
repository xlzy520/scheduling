<template>
  <dj-dialog title="查看" ref="dialog" @close="close" :has-footer="false" width="1180px">
    <div class="content" v-loading="loading">
      <classify-form :form-data="formData" ref="form" :config="formConfig" :column-num="3"></classify-form>
    </div>
  </dj-dialog>
</template>

<script>
  // import prodTaskService from '@/api/service/prodTask';
  import {orderKeys} from "../../../../utils/system/constant/dataKeys";
  import planArrangeService from '@/api/service/planArrange';
  import dayjs from 'dayjs';

  export default {
    name: 'prodTaskView',
    data() {
      return {
        formData: {},
        // formConfig: [
        //   {
        //     title: '订单信息',
        //     hasLine: true,
        //     formOptions: [
        //       {formItem: {prop: 'produceOrderNumber', label: '生产编号：'}},
        //       {
        //         type: 'custom', isText: true, formItem: {prop: 'arriveTime', label: '订单交期：'},
        //         render: (h) => {
        //           const time = this.formData.arriveTime;
        //           if (time) {
        //             return (
        //               <span>{dayjs(time).format('YYYY-MM-DD')}</span>
        //             );
        //           }
        //         }
        //       },
        //       {formItem: {prop: 'customerName', label: '客户名称：'}},
        //       // {formItem: {prop: 'sort', label: '订单排序：'}},
        //       {
        //         type: 'custom', isText: true, formItem: {prop: 'orderFlag', label: '订单标记：'},
        //         render: (h) => {
        //           const flagMap = ['普通', '加急', '延期'];
        //           let text = flagMap[this.formData.orderFlag] || '';
        //           return (
        //             <span>{text}</span>
        //           );
        //         },
        //       },
        //     ]
        //   },
        //   {
        //     title: '产品信息',
        //     hasLine: true,
        //     formOptions: [
        //       {formItem: {prop: 'grouponProductName', label: '产品名称：'}},
        //       {formItem: {prop: 'pieceAmount', label: '订单数量：'}},
        //       {formItem: {prop: 'materialCode', label: '用料代码：'}},
        //       {
        //         type: 'custom', isText: true,
        //         formItem: {prop: 'tileModel', label: '瓦楞楞型：'},
        //         render: (h) => {
        //           let fluteType = this.formData.tileModel || '';
        //           let layer = this.formData.layer || '';
        //           return (
        //             <span>{`${layer}${fluteType}`}</span>
        //           );
        //         }
        //       },
        //       {
        //         type: 'custom', isText: true, formItem: {prop: 'chanpingguige', label: '产品规格：'},
        //         render: (h) => {
        //           if (this.formData.productLength || this.formData.productLength === 0) {
        //             return (
        //               <span>{this.formData.productLength + '*' + this.formData.productWidth + '*' + this.formData.productHeight}</span>
        //             );
        //           }
        //         },
        //       },
        //       {
        //         type: 'custom', isText: true, formItem: {prop: 'xialiaoguige', label: '下料规格：'},
        //         render: (h) => {
        //           return (
        //             <span>{this.formData.materialLength + '*' + this.formData.materialWidth}</span>
        //           );
        //         },
        //       },
        //       {formItem: {prop: 'staveType', label: '压线方式：'}},
        //       {formItem: {prop: 'hformula', label: '横压公式：'}},
        //     ]
        //   },
        //   {
        //     title: '最终生产信息',
        //     hasLine: true,
        //     formOptions: [
        //       {formItem: {prop: 'paperSize', label: '最优门幅：'}},
        //       {formItem: {prop: 'cutCount', label: '切数：'}},
        //       {formItem: {prop: 'knifeCount', label: '刀数：'}},
        //       {formItem: {prop: 'produceAmount', label: '生产数量：'}},
        //       {formItem: {prop: 'vformula', label: '纵压公式：'}},
        //       {formItem: {prop: 'materialWidth', label: '切宽：'}},
        //       {formItem: {prop: 'orderMeter', label: '订单米数：'}},
        //       {formItem: {prop: 'trimming', label: '修边(mm)：'}},
        //       {formItem: {prop: 'trimmingRate', label: '修边率：'}},
        //       {formItem: {prop: 'stackFlag', label: '叠单标志：'}},
        //     ]
        //   },
        //   {
        //     title: '原生产信息',
        //     hasLine: true,
        //     formOptions: [
        //       {formItem: {prop: 'calPaperSize_original', label: '最优门幅：'}},
        //       {formItem: {prop: 'cut_original', label: '切数：'}},
        //       {formItem: {prop: 'paperCount_original', label: '刀数：'}},
        //       {formItem: {prop: 'pieceAmount_original', label: '生产数量：'}},
        //       {formItem: {prop: 'vformula_original', label: '纵压公式：'}},
        //       {formItem: {prop: 'materialWidth_original', label: '切宽：'}},
        //       {formItem: {prop: 'paperLength_original', label: '订单米数：'}},
        //       {formItem: {prop: 'wasteWidth_original', label: '修边(mm)：'}},
        //       {formItem: {prop: 'wasteRate_original', label: '修边率：'}},
        //       // {formItem: {prop: 'stackFlag_original', label: '叠单标志：'}},
        //     ]
        //   },
        // ],
        formConfig: [
          {
            title: '订单信息',
            formOptions: [
              {
                formItem: {
                  prop: orderKeys.productionNo,
                  label: '生产编号'
                },
              },
              {
                formItem: {
                  prop: 're-deliveryTime',
                  label: '订单交期'
                },
                computed: ()=>{
                  return dayjs(this.formData[orderKeys.deliveryTime]).format('YYYY-MM-DD');
                }
              },
              {
                formItem: {
                  prop: orderKeys.customerName,
                  label: '客户名称'
                },
              },
              // {
              //   formItem: {
              //     prop: 're-' + orderKeys.sortIndex,
              //     label: '订单排序'
              //   },
              //   computed: ()=>{
              //     let index = this.formData[orderKeys.sortIndex];
              //     return index + '' === '0' ? '' : index;
              //   }
              // },
              {
                formItem: {
                  prop: 're-orderTip',
                  label: '订单标记'
                },
                computed: ()=>{
                  let obj = this.$enum.orderTip._swap[this.formData[orderKeys.orderTip]] || {};
                  return obj.label || '';
                }
              },
            ]
          },
          {
            title: '产品信息',
            formOptions: [
              {
                formItem: {
                  prop: orderKeys.productName,
                  label: '产品名称'
                },
              },
              {
                formItem: {
                  prop: orderKeys.orderAmount,
                  label: '订单数量'
                },
              },
              {
                formItem: {
                  prop: orderKeys.produceMaterial,
                  label: '用料代码'
                },
              },
              {
                formItem: {
                  prop: 're-fluteType',
                  label: '瓦楞楞型'
                },
                computed: () => {
                  let layer = this.formData[orderKeys.layer] || '';
                  let fluteType = this.formData[orderKeys.fluteType] || '';
                  return layer + fluteType;
                }
              },
              {
                formItem: {
                  prop: orderKeys.productSize,
                  label: '产品规格'
                },
              },
              {
                formItem: {
                  prop: orderKeys.materialSize,
                  label: '下料规格'
                },
              },
              {
                formItem: {
                  prop: orderKeys.linePressingMethod,
                  label: '压线方式'
                }
              },
              {
                formItem: {
                  prop: orderKeys.transversePressure,
                  label: '横压公式'
                },
              },
            ]
          },
          {
            title: '最终生产信息',
            formOptions: [
              {
                formItem: {
                  prop: 'paperSize',
                  label: '最优门幅'
                },
              },
              {
                formItem: {
                  prop: orderKeys.cutNumber,
                  label: '切数'
                },
              },
              {
                formItem: {
                  prop: orderKeys.cutterNumber,
                  label: '刀数'
                },
              },
              {
                formItem: {
                  prop: 'produceNum',
                  label: '生产数量'
                },
              },
              {
                formItem: {
                  prop: orderKeys.longitudinalPressure,
                  label: '纵压公式'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.materialWidth, 'plan'),
                  label: '切宽'
                },
              },
              {
                formItem: {
                  prop: orderKeys.orderMetres,
                  label: '订单米数'
                }
              },
              {
                formItem: {
                  prop: orderKeys.trim,
                  label: '修边(mm)'
                },
              },
              {
                formItem: {
                  prop: orderKeys.trimRate,
                  label: '修边率'
                },
              },
              {
                formItem: {
                  prop: orderKeys.stackUp,
                  label: '叠单标志'
                },
              },
            ]
          },
          {
            title: '原生产信息',
            formOptions: [
              {
                formItem: {
                  prop: this.$method.getOriginKey('paperSize', 'old'),
                  label: '最优门幅'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.cutNumber, 'old'),
                  label: '切数'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.cutterNumber, 'old'),
                  label: '刀数'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey('produceNum', 'old'),
                  label: '生产数量'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.longitudinalPressure, 'old'),
                  label: '纵压公式'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.materialWidth, 'old'),
                  label: '切宽'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.orderMetres, 'old'),
                  label: '订单米数'
                }
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.trim, 'old'),
                  label: '修边(mm)'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.trimRate, 'old'),
                  label: '修边率'
                },
              },
              // {
              //   formItem: {
              //     prop: this.$method.getOriginKey(orderKeys.stackUp, 'old'),
              //     label: '叠单标志'
              //   },
              // },
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
        this.dj_api_extend(planArrangeService.getOrder, {
          produceOrderNumber: id
        }).then(res => {
          res['tip'] = this.$method.getOrderTip(res, true);
          res[orderKeys.materialSize] = this.$method.getMaterialSize(res);
          res[orderKeys.productSize] = this.$method.getProductSize(res);
          this.formData = res || {};

          // res['arriveTime'] = this.$method.parseTime(res['arriveTime']);
          // let _orderPlanOriginal = {};
          // for (let item in res.orderPlanOriginal) {
          //   if (res.orderPlanOriginal.hasOwnProperty(item)) {
          //     _orderPlanOriginal[item + '_original'] = res.orderPlanOriginal[item];
          //   }
          // }
          // this.formData = Object.assign({}, res.produceTask, _orderPlanOriginal);
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
