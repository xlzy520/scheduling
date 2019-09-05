<template>
    <dj-dialog ref="dialog" @close="close" title="查看" width="593px">
      <el-tabs v-model="activeTab" @tab-click="handleClick">
        <el-tab-pane label="订单信息" name="1">
          <el-row>
            <el-col :span="17"><span class="bold">生产编号: {{order[orderKeys.productionNo]}}</span></el-col>
            <el-col :span="7"><span class="bold">生产状态: <span class="status">{{$enum.productStatus._swap[order[orderKeys.productStatus]] && $enum.productStatus._swap[order[orderKeys.productStatus]].label}}</span></span></el-col>
            <el-col :span="24"><span class="bold">订单消息</span></el-col>
            <template v-for="(item, index) in orderOptions[isStore]">
              <el-col :span="index%2 ? 10 : 14"><span class="">{{item.label}}: {{item.formatter ? item.formatter(order[item.prop]) : order[item.prop]}}</span></el-col>
            </template>
            <el-col :span="24"><p class="line"></p></el-col>
            <el-col :span="24"><span class="bold">产品信息</span></el-col>
            <template v-for="(item, index) in messageOptions[isStore]">
              <el-col :span="index%2 ? 10 : 14"><span class="">{{item.label}}: {{item.formatter ? item.formatter(order[item.prop]) : order[item.prop]}}</span></el-col>
            </template>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="操作记录" name="2">
          <base-table :data="recordData" :columns="recordColumns"></base-table>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer">
        <el-button @click="close">关闭</el-button>
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
              prop: orderKeys.customerName,
              label: '客户名称',
            },
            {
              prop: orderKeys.contacts,
              label: '联系人',
            },
            {
              prop: orderKeys.contactWay,
              label: '联系方式',
            },
            {
              prop: orderKeys.orderTip,
              label: '订单标记',
              formatter: (cur) => {
                let obj = this.$enum.orderTip._swap[cur] || {};
                return obj.label || ''
              }
            },
            {
              prop: orderKeys.address,
              label: '地址',
            },
            {
              prop: orderKeys.deliveryTime,
              label: '订单交期',
              formatter(cur) {
                return dayjs(cur).format('YYYY-MM-DD');
              }
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
              prop: orderKeys.deliveryTime,
              label: '订单交期',
              formatter(cur) {
                return dayjs(cur).format('YYYY-MM-DD');
              }
            },
          ]
        },
        messageOptions: {
          false:  [
            {
              prop: orderKeys.productName,
              label: '产品名称',
            },
            {
              prop: orderKeys.orderAmount,
              label: '订单数量',
            },
            {
              prop: orderKeys.materialName,
              label: '材料名称',
            },
            {
              prop: orderKeys.fluteType,
              label: '瓦楞楞型',
            },
            // todo 暂时没有，等待后端更新
            {
              prop: orderKeys.productSize,
              label: '产品规格',
            },
            {
              prop: orderKeys.materialSize,
              label: '下料规格',
              formatter: () => {
                return this.order[orderKeys.materialLength] + '*' + this.order[orderKeys.materialWidth];
              }
            },
            {
              prop: orderKeys.linePressingMethod,
              label: '压线方式',
            },
            {
              prop: orderKeys.longitudinalPressure,
              label: '纵压公式',
            },
            {
              prop: orderKeys.transversePressure,
              label: '横压公式',
            },
          ],
          true: [
            {
              prop: orderKeys.materialName,
              label: '材料名称',
            },
            {
              prop: orderKeys.orderAmount,
              label: '订单数量',
            },
            {
              prop: orderKeys.materialSize,
              label: '下料规格',
              formatter: () => {
                return this.order[orderKeys.materialLength] + '*' + this.order[orderKeys.materialWidth];
              }
            },
            {
              prop: orderKeys.fluteType,
              label: '瓦楞楞型',
            },
            {
              prop: orderKeys.linePressingMethod,
              label: '压线方式',
            },
            {
              prop: orderKeys.longitudinalPressure,
              label: '纵压公式',
            },
            {
              prop: orderKeys.transversePressure,
              label: '横压公式',
            },
          ]
        },
        isStore: true, // 是否是备料订单
        orderKeys,
      };
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
        this.dj_api_extend(orderManageService.getOrderById, {producOrderNumber: prodId}).then(res=>{
          this.order = res;
          console.log(this.order);
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
  .bold {
    font-weight: bold;
  }
  .status {
    color: #3654ea;
  }
  .el-row {
    margin-top: 10px;
  }
  .el-col {
    margin-bottom: 30px;
  }
  .line {
    border-top: 1px solid #ebeef5;
  }
</style>
