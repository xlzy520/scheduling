<template>
    <dj-dialog ref="dialog" @close="close" title="查看" width="780px" :has-footer="false">
      <div class="dialog-content">
        <el-tabs v-loading="isLoading" v-model="activeTab" @tab-click="handleClick">
          <el-tab-pane label="订单信息" name="1">
            <classify-form ref="form" :config="config" :formData="order" :column-num="2"></classify-form>
            <!--<el-row>-->
            <!--<el-col :span="17"><span class="bold">生产编号: {{order[orderKeys.productionNo]}}</span></el-col>-->
            <!--<el-col :span="7"><span class="bold">生产状态: <span class="status">{{$enum.productStatus._swap[order[orderKeys.productStatus]] && $enum.productStatus._swap[order[orderKeys.productStatus]].label}}</span></span></el-col>-->
            <!--<el-col :span="24"><span class="bold">订单消息</span></el-col>-->
            <!--<template v-for="(item, index) in orderOptions[isStore]">-->
            <!--<el-col :span="index%2 ? 10 : 14"><span class="">{{item.formItem.label}}: {{item.formatter ? item.formatter(order[item.formItem.prop]) : order[item.formItem.prop]}}</span></el-col>-->
            <!--</template>-->
            <!--<el-col :span="24"><p class="line"></p></el-col>-->
            <!--<el-col :span="24"><span class="bold">产品信息</span></el-col>-->
            <!--<template v-for="(item, index) in messageOptions[isStore]">-->
            <!--<el-col :span="index%2 ? 10 : (messageOptions[isStore].length === index + 1 ? 24 : 14)"><span class="">{{item.formItem.label}}: {{item.formatter ? item.formatter(order[item.formItem.prop]) : order[item.formItem.prop]}}</span></el-col>-->
            <!--</template>-->
            <!--</el-row>-->
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="2">
            <base-table :data="recordData" :columns="recordColumns"></base-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </dj-dialog>
</template>
<script>
  import { orderKeys } from "../../../utils/system/constant/dataKeys";
  import orderManageService from '../../../api/service/orderManage';
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
                label: '联系人',
              }
            },
            {
              formItem: {
                prop: orderKeys.contactWay,
                label: '联系方式',
              }
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
              // formatter: (cur) => {
              //   let obj = this.$enum.orderTip._swap[cur] || {};
              //   return obj.label || ''
              // }
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
                prop: orderKeys.deliveryTime,
                label: '订单交期',
              },
              render: (h) => {
                return (
                  <span>{dayjs(this.order[orderKeys.deliveryTime]).format('YYYY-MM-DD')}</span>
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
                return (
                  <span>{dayjs(this.order[orderKeys.deliveryTime]).format('YYYY-MM-DD')}</span>
                );
              },
              // formatter(cur) {
              //   return dayjs(cur).format('YYYY-MM-DD');
              // }
            },
          ]
        },
        messageOptions: {
          false:  [
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
              formItem: {
                prop: orderKeys.productSize,
                label: '产品规格',
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
        ]
      }
    },
    created() {
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
          // console.log(this.order);
        }).finally(()=>{
          this.isLoading = false;
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
  .dialog-content{
    height: 632px
  }
  .classifyForm {
    /deep/ .dj-form:nth-of-type(1) {
      font-weight: bold;
      .status {
        color: #3654ea;
      }
    }
  }
  /*.bold {*/
    /*font-weight: bold;*/
  /*}*/
  /*.status {*/
    /*color: #3654ea;*/
  /*}*/
  /*.el-row {*/
    /*margin-top: 10px;*/
  /*}*/
  /*.el-col {*/
    /*margin-bottom: 30px;*/
  /*}*/
  /*.line {*/
    /*border-top: 1px solid #ebeef5;*/
  /*}*/
</style>
