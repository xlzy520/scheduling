<template>
  <dj-dialog ref="dialog" @close="close" width="1160px" title="查看" @confirm="confirm">
    <el-tabs v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane label="订单信息" name="1">
        <classify-form ref="form" hasLine :formData="formData" :config="config" :column-num="3"></classify-form>
      </el-tab-pane>
      <el-tab-pane label="编辑记录" name="2">
        <base-table :data="recordData" :columns="recordColumns"></base-table>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer"></div>
  </dj-dialog>
</template>
<script>
  import {orderKeys} from "../../../utils/system/constant/dataKeys";
  import planArrangeService from '../../../api/service/planArrange'
  export default {
    name: 'lookDialog',
    data: function () {
      return {
        config: [
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
                  prop: orderKeys.deliveryTime,
                  label: '订单交期'
                },
              },
              {
                formItem: {
                  prop: orderKeys.customerName,
                  label: '客户名称'
                },
              },
              {
                formItem: {
                  prop: orderKeys.sortIndex,
                  label: '订单排序'
                },
              },
              {
                formItem: {
                  prop: 'tag',
                  label: '订单标记'
                },
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
                  prop: orderKeys.materialCode,
                  label: '用料代码'
                },
              },
              {
                formItem: {
                  prop: orderKeys.fluteType,
                  label: '瓦楞楞型'
                },
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
                  prop: orderKeys.optimalSize,
                  label: '最优门幅'
                },
              },
              {
                formItem: {
                  prop: 'singleCutterNumber',
                  label: '单台纵切刀数'
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
                  prop: orderKeys.productAmount,
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
                  prop: 'finalCutWidth',
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
                  label: '利用率(%)'
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
                  prop: orderKeys.optimalSize,
                  label: '最优门幅'
                },
              },
              {
                formItem: {
                  prop: 'singleCutterNumber',
                  label: '单台纵切刀数'
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
                  prop: orderKeys.productAmount,
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
                  prop: 'finalCutWidth',
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
                  label: '利用率(%)'
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
        ],
        formData: {},
        activeTab: '1',
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'time', width: 100},
          {label: '操作人', prop: 'operator', width: 80},
          {label: '操作内容', prop: 'event', width: 200}
        ],
      };
    },
    created() {
    },
    methods: {
      handleClick() {
        if (this.activeTab === '2' && !this.recordData.length) {
          // todo 对接获取操作记录接口
          console.log('getRecord');
        }
      },
      getOrderMsg(params) {
        this.dj_api_extend(planArrangeService.getOrder, params).then(res=>{
          res['tip'] = this.$method.getOrderTip(res, true);
          res[orderKeys.materialSize] = this.$method.getMaterialSize(res);
          res[orderKeys.productSize] = this.$method.getProductSize(res);
          this.formData = res || {};
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
