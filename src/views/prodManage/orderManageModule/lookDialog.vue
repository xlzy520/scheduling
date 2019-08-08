<template>
    <dj-dialog ref="dialog" @close="close" title="查看" width="593px">
      <el-tabs v-model="activeTab" @tab-click="handleClick">
        <el-tab-pane label="订单信息" name="1">
          <el-row>
            <el-col :span="17"><span class="bold">订单编号: {{order.orderId}}</span></el-col>
            <el-col :span="7"><span class="bold">生产状态: <span class="status">{{order.productStatus}}</span></span></el-col>
            <el-col :span="24"><span class="bold">订单消息</span></el-col>
            <template v-for="(item, index) in orderOptions[isStore]">
              <el-col :span="index%2 ? 10 : 14"><span class="">{{item.label}}: {{order[item.prop]}}</span></el-col>
            </template>
            <el-col :span="24"><p class="line"></p></el-col>
            <el-col :span="24"><span class="bold">产品信息</span></el-col>
            <template v-for="(item, index) in messageOptions[isStore]">
              <el-col :span="index%2 ? 10 : 14"><span class="">{{item.label}}: {{order[item.prop]}}</span></el-col>
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
          true: [
            {
              prop: 'customerName',
              label: '客户名称',
            },
            {
              prop: 'Contacts',
              label: '联系人',
            },
            {
              prop: 'phone',
              label: '联系方式',
            },
            {
              prop: 'orderTip',
              label: '订单标记',
            },
            {
              prop: 'address',
              label: '地址',
            },
            {
              prop: 'deliveryTime',
              label: '订单交期',
            },
          ],
          false: [
            {
              prop: 'orderTip',
              label: '订单标记',
            },
            {
              prop: 'deliveryTime',
              label: '订单交期',
            },
          ]
        },
        messageOptions: {
          true:  [
            {
              prop: 'productName',
              label: '产品名称',
            },
            {
              prop: 'orderAmount',
              label: '订单数量',
            },
            {
              prop: 'materialName',
              label: '材料名称',
            },
            {
              prop: 'fluteType',
              label: '瓦楞楞型',
            },
            {
              prop: 'productSize',
              label: '产品规格',
            },
            {
              prop: 'materialSize',
              label: '下料规格',
            },
            {
              prop: 'linePressingMethod',
              label: '压线方式',
            },
            {
              prop: 'longitudinalPressure',
              label: '纵压公式',
            },
            {
              prop: 'transversePressure',
              label: '横压公式',
            },
          ],
          false: [
            {
              prop: 'materialCode',
              label: '用料代码',
            },
            {
              prop: 'materialSize',
              label: '订单数量',
            },
            {
              prop: 'materialSize',
              label: '下料规格',
            },
            {
              prop: 'fluteType',
              label: '瓦楞楞型',
            },
            {
              prop: 'linePressingMethod',
              label: '压线方式',
            },
            {
              prop: 'longitudinalPressure',
              label: '纵压公式',
            },
            {
              prop: 'transversePressure',
              label: '横压公式',
            },
          ]
        },
        isStore: true // 是否是备料订单
      };
    },
    // computed: {
    //   orderOptions() {
    //     if (true) {
    //       return [
    //         {
    //           prop: 'customerName',
    //           label: '客户名称',
    //         },
    //         {
    //           prop: 'Contacts',
    //           label: '联系人',
    //         },
    //         {
    //           prop: 'phone',
    //           label: '联系方式',
    //         },
    //         {
    //           prop: 'orderTip',
    //           label: '订单标记',
    //         },
    //         {
    //           prop: 'address',
    //           label: '地址',
    //         },
    //         {
    //           prop: 'deliveryTime',
    //           label: '订单交期',
    //         },
    //       ]
    //     } else {
    //       return [
    //         {
    //           prop: 'orderTip',
    //           label: '订单标记',
    //         },
    //         {
    //           prop: 'deliveryTime',
    //           label: '订单交期',
    //         },
    //       ];
    //     }
    //   },
    //   messageOptions() {
    //     if (true) {
    //       return [
    //         {
    //           prop: 'productName',
    //           label: '产品名称',
    //         },
    //         {
    //           prop: 'orderAmount',
    //           label: '订单数量',
    //         },
    //         {
    //           prop: 'materialName',
    //           label: '材料名称',
    //         },
    //         {
    //           prop: 'fluteType',
    //           label: '瓦楞楞型',
    //         },
    //         {
    //           prop: 'productSize',
    //           label: '产品规格',
    //         },
    //         {
    //           prop: 'materialSize',
    //           label: '下料规格',
    //         },
    //         {
    //           prop: 'linePressingMethod',
    //           label: '压线方式',
    //         },
    //         {
    //           prop: 'longitudinalPressure',
    //           label: '纵压公式',
    //         },
    //         {
    //           prop: 'transversePressure',
    //           label: '横压公式',
    //         },
    //       ]
    //     } else {
    //       return [
    //         {
    //           prop: 'materialCode',
    //           label: '用料代码',
    //         },
    //         {
    //           prop: 'materialSize',
    //           label: '订单数量',
    //         },
    //         {
    //           prop: 'materialSize',
    //           label: '下料规格',
    //         },
    //         {
    //           prop: 'fluteType',
    //           label: '瓦楞楞型',
    //         },
    //         {
    //           prop: 'linePressingMethod',
    //           label: '压线方式',
    //         },
    //         {
    //           prop: 'longitudinalPressure',
    //           label: '纵压公式',
    //         },
    //         {
    //           prop: 'transversePressure',
    //           label: '横压公式',
    //         },
    //       ]
    //     }
    //   }
    // },
    created() {
    },
    methods: {
      open(orderId) {
        this.$refs.dialog.open();
        this.getOrderDetail(orderId);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
      getOrderDetail(orderId) {
        // todo 对接获取订单详情接口
        console.log('getOrderDetail');
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
