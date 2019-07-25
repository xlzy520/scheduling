<template>
    <dj-dialog ref="dialog" @close="close" title="查看" width="800px">
      <el-tabs v-model="activeTab" @tab-click="handleClick">
        <el-tab-pane label="订单信息" name="1">
          订单信息
        </el-tab-pane>
        <el-tab-pane label="操作记录" name="2">
          <base-table :data="recordData" :columns="recordColumns"></base-table>
        </el-tab-pane>
      </el-tabs>
    </dj-dialog>
</template>
<script>
  export default {
    name: 'lookDialog',
    data: function () {
      return {
        recordData: [],
        recordColumns: [
          {label: '操作时间', prop: 'time'},
          {label: '操作人', prop: 'operator'},
          {label: '操作内容', prop: 'event'}
        ],
        activeTab: '1',
        order: {}
      };
    },
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
