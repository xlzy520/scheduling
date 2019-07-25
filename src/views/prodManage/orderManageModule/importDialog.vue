<template>
  <dj-dialog ref="dialog" @close="close" title="提示" width="400px">
    <p>{{ isImportAll ? '确认导入所有订单进入生产计划' : `确认导入所选${orders.length}条订单进入生产计划` }}</p>
  </dj-dialog>
</template>
<script>
  export default {
    name: 'importDialog',
    data: function () {
      return {
        orders: [],
        isImportAll: false
      };
    },
    created() {
    },
    methods: {
      open(orders) {
        console.log(orders);
        this.$refs.dialog.open();
        if (orders === true) {
          this.isImportAll = true;
        } else {
          this.orders = orders;
        }
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    }
  };
</script>
<style lang="less" scoped>
  p {
    text-align: center;
    line-height: 50px;
  }
</style>
