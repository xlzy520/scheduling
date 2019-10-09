<template>
  <dj-dialog ref="dialog" @close="close" title="查看" width="780px">
    <el-tabs v-loading="isLoading" v-model="activeTab" @tab-click="handleClick">
        <el-tab-pane label="订单信息" name="1">
          <classify-form :config="config" :form-data="formData" :column-num="2"></classify-form>
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
  import record from "../../../api/service/record";
  import dialogFixed from "../../../mixins/dialogFixed";
  export default {
    name: 'lookDialog',
    mixins: [dialogFixed],
    data: function () {
      return {
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'operateTime', width: 100},
          {label: '操作人', prop: 'operator', width: 80},
          {label: '操作内容', prop: 'operateDetail', width: 200}
        ],
        activeTab: '1',
        formData: {},
        order_arr: [],
        orderKeys,
        formOptions_product: [
          {
            formItem: {
              prop: orderKeys.productName,
              label: '产品名称'
            },
          },
          {
            formItem: {
              prop: 'produceMaterial',
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
            type: 'custom',
            isText: true,
            formItem: {
              prop: orderKeys.fluteType,
              label: '瓦楞楞型'
            },
            render: (h) => {
              let fluteType = this.formData[orderKeys.fluteType] || '';
              let layer = this.formData[orderKeys.layer] || '';
              return (
                <span>{`${layer}${fluteType}`}</span>
              );
            },
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
        ],
        isLoading: false,
        id: ''
      };
    },
    computed: {
      config() {
        return [
          {
            formOptions: this.formOptions_header
          },
          {
            hasLine: true,
            title: '订单信息',
            formOptions: this.formOptions_order
          },
          {
            title: '产品信息',
            formOptions: this.formOptions_product
          },
        ];
      },
      formOptions_header() {
        return [
          {
            type: 'select',
            formItem: {
              prop: orderKeys.productionNo,
              label: '生产编号'
            },
            attrs: {
              keyMap: {
                value: orderKeys.productionNo,
                label: orderKeys.productionNo,
              },
              clearable: false,
              options: this.order_arr
            },
            listeners: {
              change: (val) => {
                this.changeFormData(val);
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
        ];
      },
      formOptions_order() {
        let total_arr = [
          {
            formItem: {
              prop: orderKeys.customerName,
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
            isText: true,
            render: (h)=>{
              let obj = this.$enum.orderTip._swap[this.formData[orderKeys.orderTip]] || {};
              return (<span>{obj.label || ''}</span>);
            }
          },
        ];
        let hidden_arr = [];
        let productionNo = this.formData[orderKeys.productionNo] || '';
        if (!productionNo.startsWith('V')) {
          hidden_arr = [orderKeys.mergeTime];
        }
        return total_arr.filter(obj=>!hidden_arr.includes(obj.formItem.prop));
      }
    },
    methods: {
      changeFormData(val) {
        this.formData = {...(this.order_arr.filter(obj=>obj[orderKeys.productionNo] === val)[0] || {})};
      },
      open(order) {
        this.id = order.id;
        this.$refs.dialog.open();
        this.getOrderDetail(order[orderKeys.productionNo]);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
      getOrderDetail(prodId) {
        this.isLoading = true;
        this.dj_api_extend(plannedMergerService.getOrderById, {produceOrderNumber: prodId}).then(({main, list})=>{
          this.order_arr = list;
          this.formData = {...main};
          this.updateHeight();
        }).finally(()=>{
          this.isLoading = false;
        });
      },
      getRecord() {
        this.isLoading = true;
        this.dj_api_extend(record.list, {
          sourceId: this.id,
          operaType: 1
        }).then((res) => {
          this.recordData = res.list || [];
        }).finally(() => {
          this.isLoading = false;
        });
      },
      handleClick() {
        if (this.activeTab === '2' && !this.recordData.length) {
         this.getRecord();
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  /deep/ .status {
    color: #3654ea;
  }
</style>
