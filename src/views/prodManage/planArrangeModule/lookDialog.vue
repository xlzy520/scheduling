<template>
  <dj-dialog ref="dialog" @close="close" width="1160px" title="查看">
    <el-tabs v-loading="isTableLoading" v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane label="订单信息" name="1">
        <classify-form ref="form" has-line :form-data="formData" :config="config" :column-num="3"></classify-form>
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
  import planArrangeService from '../../../api/service/planArrange';
  import record from "../../../api/service/record";
  import dayjs from 'dayjs';
  import dialogFixed from "../../../mixins/dialogFixed";
  export default {
    name: 'lookDialog',
    mixins: [dialogFixed],
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
                  prop: 'orderTipLabel',
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
                  prop: orderKeys.produceMaterial,
                  label: '用料代码'
                },
              },
              {
                formItem: {
                  prop: 'fluteTypeAndLayers',
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
            ]
          },
        ],
        formData: {},
        activeTab: '1',
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'operateTime', width: 200},
          {label: '操作人', prop: 'operator', width: 100},
          {label: '操作内容', prop: 'operateDetail', width: 700}
        ],
        isTableLoading: false,
        id: ''
      };
    },
    methods: {
      getRecord() {
        this.isTableLoading = true;
        this.dj_api_extend(record.list, {
          sourceId: this.id,
          operaType: 1
        }).then((res) => {
          this.recordData = res.list || [];
        }).finally(() => {
          this.isTableLoading = false;
        });
      },
      handleClick() {
        if (this.activeTab === '2' && !this.recordData.length) {
          this.getRecord();
        }
      },
      getOrderMsg(params) {
        this.isTableLoading = true;
        this.dj_api_extend(planArrangeService.getOrder, params).then((res = {})=>{
          this.formData = res || {};
          this.id = res.produceOrderNumber;
          this.updateHeight();
        }).finally(()=>{
          this.isTableLoading = false;
        });
      },
      open(param = {}) {
        this.$refs.dialog.open();
        this.getOrderMsg(param.data);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
  };
</script>
