<template>
    <dj-dialog ref="dialog" @close="close" title="查看" width="780px">
      <el-tabs v-loading="isLoading" v-model="activeTab" @tab-click="handleClick">
        <el-tab-pane label="订单信息" name="1">
          <classify-form ref="form" :config="config" :form-data="order" :column-num="2"></classify-form>
        </el-tab-pane>
        <el-tab-pane label="操作记录" name="2">
          <base-table :data="recordData" :columns="recordColumns"></base-table>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer"></div>
    </dj-dialog>
</template>
<script>
  import { orderKeys } from "../../../utils/system/constant/dataKeys";
  import orderManageService from '../../../api/service/orderManage';
  import record from "../../../api/service/record";
  import dayjs from 'dayjs';
  import dialogFixed from "../../../mixins/dialogFixed";
  export default {
    name: 'lookDialog',
    mixins: [dialogFixed],
    data: function () {
      return {
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'operateTime', width: 200},
          {label: '操作人', prop: 'operator', width: 100},
          {label: '操作内容', prop: 'operateDetail', width: 440}
        ],
        activeTab: '1',
        order: {},
        orderOptions: {
          false: [
            {
              formItem: {
                prop: orderKeys.customerName,
                label: '客户名称',
              }
            },
            {
              formItem: {
                prop: orderKeys.contacts,
                label: '收货人',
              }
            },
            {
              formItem: {
                prop: orderKeys.contactWay,
                label: '联系方式',
              }
            },
            {
              formItem: {
                prop: orderKeys.address,
                label: '地址',
              },
            },
            {
              type: 'custom',
              isText: true,
              formItem: {
                prop: orderKeys.orderTip,
                label: '订单标记',
              },
              render: (h) => {
                let obj = this.$enum.orderTip._swap[this.order[orderKeys.orderTip]] || {};
                return (
                  <span>{obj.label || ''}</span>
                );
              },
            },
            {
              type: 'custom',
              isText: true,
              formItem: {
                prop: orderKeys.deliveryTime,
                label: '订单交期',
              },
              render: (h) => {
                let time = this.order[orderKeys.deliveryTime];
                return (
                  <span>{time ? dayjs(time).format('YYYY-MM-DD') : ''}</span>
                );
              },
              // formatter(cur) {
              //   return dayjs(cur).format('YYYY-MM-DD');
              // }
            },
          ],
          true: [
            // {
            //   prop: orderKeys.orderTip,
            //   label: '订单标记',
            //   formatter: (cur) => {
            //     let obj = this.$enum.orderTip._swap[cur] || {};
            //     return obj.label || ''
            //   }
            // },
            {
              type: 'custom',
              isText: true,
              formItem: {
                prop: orderKeys.deliveryTime,
                label: '订单交期',
              },
              render: (h) => {
                let time = this.order[orderKeys.deliveryTime];
                return (
                  <span>{time ? dayjs(time).format('YYYY-MM-DD') : ''}</span>
                );
              },
              // formatter(cur) {
              //   return dayjs(cur).format('YYYY-MM-DD');
              // }
            },
          ]
        },
        messageOptions: {
          false: [
            {
              formItem: {
                prop: orderKeys.productName,
                label: '产品名称',
              }
            },
            {
              formItem: {
                prop: orderKeys.orderAmount,
                label: '订单数量',
              }
            },
            {
              formItem: {
                prop: orderKeys.materialName,
                label: '材料名称',
              },
            },
            {
              type: 'custom',
              isText: true,
              formItem: {
                prop: orderKeys.fluteType,
                label: '瓦楞楞型',
              },
              render: (h) => {
                let fluteType = this.order[orderKeys.fluteType] || '';
                let layer = this.order[orderKeys.layer] || '';
                return (
                  <span>{`${layer}${fluteType}`}</span>
                );
              },
            },
            // todo 暂时没有，等待后端更新
            {
              type: 'custom',
              isText: true,
              formItem: {
                prop: orderKeys.productSize,
                label: '产品规格',
              },
              render: (h) => {
                return (
                  <span>{this.$method.getProductSize(this.order)}</span>
                );
              },
            },
            {
              type: 'custom',
              isText: true,
              formItem: {
                prop: orderKeys.materialSize,
                label: '下料规格',
              },
              render: (h) => {
                let length = this.order[orderKeys.materialLength];
                let width = this.order[orderKeys.materialWidth];
                return (
                  <span>{length && width ? `${length}*${width}` : ''}</span>
                );
              },
              // formatter: () => {
              //   return this.order[orderKeys.materialLength] + '*' + this.order[orderKeys.materialWidth];
              // }
            },
            {
              formItem: {
                prop: orderKeys.linePressingMethod,
                label: '压线方式',
              }
            },
            {
              formItem: {
                prop: orderKeys.longitudinalPressure,
                label: '纵压公式',
              }
            },
            {
              formItem: {
                prop: orderKeys.transversePressure,
                label: '横压公式',
              }
            },
          ],
          true: [
            {
              formItem: {
                prop: orderKeys.materialName,
                label: '材料名称',
              }
            },
            {
              formItem: {
                prop: orderKeys.orderAmount,
                label: '订单数量',
              }
            },
            {
              type: 'custom',
              isText: true,
              formItem: {
                prop: orderKeys.materialSize,
                label: '下料规格',
              },
              render: (h) => {
                let length = this.order[orderKeys.materialLength];
                let width = this.order[orderKeys.materialWidth];
                return (
                  <span>{length && width ? `${length}*${width}` : ''}</span>
                );
              },
              // formatter: () => {
              //   return this.order[orderKeys.materialLength] + '*' + this.order[orderKeys.materialWidth];
              // }
            },
            {
              type: 'custom',
              isText: true,
              formItem: {
                prop: orderKeys.fluteType,
                label: '瓦楞楞型',
              },
              render: (h) => {
                let fluteType = this.order[orderKeys.fluteType] || '';
                let layer = this.order[orderKeys.layer] || '';
                return (
                  <span>{`${layer}${fluteType}`}</span>
                );
              },
            },
            {
              formItem: {
                prop: orderKeys.linePressingMethod,
                label: '压线方式',
              }
            },
            {
              formItem: {
                prop: orderKeys.longitudinalPressure,
                label: '纵压公式',
              }
            },
            {
              formItem: {
                prop: orderKeys.transversePressure,
                label: '横压公式',
              }
            },
          ]
        },
        isStore: true, // 是否是备料订单
        isLoading: false, // 是否是备料订单
        orderKeys,
        id: ''
      };
    },
    computed: {
      config() {
        return [
          {
            formOptions: [
              {
                formItem: {
                  prop: orderKeys.productionNo,
                  label: '生产编号'
                }
              },
              {
                type: 'custom',
                isText: true,
                formItem: {
                  prop: orderKeys.productStatus,
                  label: '生产状态'
                },
                render: (h)=>{
                  let obj = this.$enum.productStatus._swap[this.order[orderKeys.productStatus]] || {};
                  return (
                    <span class="status">{obj.label || ''}</span>
                  );
                }
              },
            ]
          },
          {
            title: '订单信息',
            hasLine: true,
            formOptions: this.orderOptions[this.isStore]
          },
          {
            title: '产品信息',
            formOptions: this.messageOptions[this.isStore]
          }
        ];
      }
    },
    methods: {
      open(order) {
        this.$refs.dialog.open();
        this.isStore = this.$enum.orderType.preparingMaterials.value === order[orderKeys.orderType];
        this.getOrderDetail(order[orderKeys.productionNo]);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
      getOrderDetail(prodId) {
        this.isLoading = true;
        this.dj_api_extend(orderManageService.getOrderById, {produceOrderNumber: prodId}).then(res=>{
          this.order = res;
          this.id = res.produceOrderNumber;
          this.updateHeight();
        }).finally(()=>{
          this.isLoading = false;
        });
      },
      getRecord() {
        this.isLoading = true;
        this.dj_api_extend(record.list, {
          sourceId: this.id,
          operaType: 0
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
  .classify-form {
    /deep/ .dj-form:nth-of-type(1) {
      font-weight: bold;
      .status {
        color: #3654ea;
      }
    }
  }
</style>
