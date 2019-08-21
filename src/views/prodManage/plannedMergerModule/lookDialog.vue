<template>
  <dj-dialog ref="dialog" @close="close" title="查看" width="780px">
    <el-tabs v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane label="订单信息" name="1">
        <dj-form :formData="formData" :formOptions="formOptions_header" :column-num="2"></dj-form>
        <p class="font-default">订单信息</p>
        <dj-form labelSuffix=":" :formData="formData" :formOptions="formOptions_order" :column-num="2"></dj-form>
        <p class="line"></p>
        <p class="font-default">产品信息</p>
        <dj-form labelSuffix=":" :formData="formData" :formOptions="formOptions_product" :column-num="2"></dj-form>
      </el-tab-pane>
      <el-tab-pane label="编辑记录" name="2">
        <base-table :data="recordData" :columns="recordColumns"></base-table>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer"></div>
  </dj-dialog>
</template>
<script>
  import { orderKeys } from "../../../utils/system/constant/dataKeys";
  import plannedMergerService from '../../../api/service/plannedMerger';
  import dayjs from 'dayjs';
  export default {
    name: 'lookDialog',
    data: function () {
      return {
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'time', width: 100},
          {label: '操作人', prop: 'operator', width: 80},
          {label: '操作内容', prop: 'event', width: 200}
        ],
        activeTab: '1',
        formData: {},
        orderKeys,
        formOptions_header: [
          {
            type: 'select',
            formItem: {
              prop: orderKeys.orderId,
              label: '订单编号'
            },
            attrs: {
              options: []
            },
            listeners: {
              input: () => {
                this.changeFormData();
              }
            }
          },
          {
            type: 'custom',
            formItem: {
              prop: orderKeys.mergeStatus,
              label: '合并状态:'
            },
            render: (h)=>{
              let obj = this.$enum.mergeStatus._swap[this.formData[orderKeys.mergeStatus]] || {};
              return (<span class="status">{obj.label || ''}</span>);
            }
          },
        ],
        formOptions_product: [
          {
            formItem: {
              prop: orderKeys.productName,
              label: '产品名称'
            },
          },
          {
            formItem: {
              prop: orderKeys.materialCode,
              label: '用料代码'
            }
          },
          {
            formItem: {
              prop: orderKeys.orderAmount,
              label: '订单数量'
            }
          },
          {
            formItem: {
              prop: orderKeys.productAmount,
              label: '生产数量'
            }
          },
          {
            formItem: {
              prop: orderKeys.productSize,
              label: '产品规格'
            }
          },
          {
            formItem: {
              prop: orderKeys.materialSize,
              label: '下料规格'
            }
          },
          {
            formItem: {
              prop: orderKeys.optimalSize,
              label: '最优门幅'
            }
          },
          {
            formItem: {
              prop: orderKeys.cutNumber,
              label: '切数'
            }
          },
          {
            formItem: {
              prop: orderKeys.orderMetres,
              label: '订单米数'
            }
          },
          {
            formItem: {
              prop: orderKeys.fluteType,
              label: '瓦楞楞型'
            }
          },
          {
            formItem: {
              prop: orderKeys.trim,
              label: '修边'
            }
          },
          {
            formItem: {
              prop: orderKeys.trimRate,
              label: '修边率'
            }
          },
          {
            formItem: {
              prop: orderKeys.linePressingMethod,
              label: '压线方式'
            }
          },
          {
            formItem: {
              prop: orderKeys.longitudinalPressure,
              label: '纵压公式'
            }
          },
          {
            formItem: {
              prop: orderKeys.transversePressure,
              label: '横压公式'
            }
          },
        ]
      };
    },
    computed: {
      formOptions_order() {
        let total_arr = [
          {
            formItem: {
              prop: 'customerMsg',
              label: '客户信息'
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
              prop: orderKeys.mergeTime,
              label: '合并时间'
            },
          },
          {
            type: 'custom',
            formItem: {
              prop: orderKeys.orderTip,
              label: '订单标记'
            },
            render: (h)=>{
              let obj = this.$enum.orderTip._swap[this.formData[orderKeys.orderTip]] || {};
              return (<span>{obj.label || ''}</span>);
            }
          },
        ];
        let hidden_arr = [];
        let productionNo = this.formData[orderKeys.productionNo] || '';
        if (!productionNo.startsWith('V')) {
          hidden_arr = [orderKeys.mergeTime]
        }
        return total_arr.filter(obj=>!hidden_arr.includes(obj.formItem.prop));
      }
    },
    created() {
    },
    methods: {
      changeFormData() {

      },
      open(order) {
        this.$refs.dialog.open();
        this.getOrderDetail(order[orderKeys.productionNo]);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
      getOrderDetail(prodId) {
        this.dj_api_extend(plannedMergerService.getOrderById, {id: prodId}).then(res=>{
          let _res = res || {};
          let materialLength = res[orderKeys.materialLength];
          let materialWidth = res[orderKeys.materialWidth];
          if (materialLength && materialWidth) {
            _res[orderKeys.materialSize] = `${materialLength}*${materialWidth}`;
          }
          this.formData = _res;
        });
      },
      handleClick() {
        if (this.activeTab === '2' && !this.recordData.length) {
          // todo 对接获取操作记录接口
          console.log('getRecord');
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  /deep/ .status {
    color: #3654ea;
  }
  .line {
    margin-top: 11px;
    border-top: 1px solid #ebeef5;
    margin-bottom: 24px;
  }
  .el-tab-pane {
    .dj-form:not(:nth-of-type(1)) {
      margin-bottom: 13px;
      /deep/ .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  .font-subhead {
    margin-top: 11px;
  }
</style>
