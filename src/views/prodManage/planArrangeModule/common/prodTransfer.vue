<template>
  <order-transfer :value="value" :data="data" :titles="['选择生产订单', '待更换生产订单']" @input="$listeners.input">
    <div class="transfer-footer" slot="left-footer" slot-scope="{list, keyMap}">
      <span>选中订单米数：{{calcMeters(list, keyMap)}}米</span>
    </div>
    <div class="transfer-footer" slot="right-footer" slot-scope="{list, keyMap}">
      <span>待更换订单米数：{{calcMeters(list, keyMap)}}米</span>
    </div>
  </order-transfer>
</template>
<script>
  import orderTransfer from './orderTransfer';
  export default {
    name: 'prodTransfer',
    props: {
      data: Array,
      value: Array
    },
    data: function () {
      return {};
    },
    created() {
    },
    components: {orderTransfer},
    methods: {
      calcMeters(arr = [], keyMap, sum = 0) {
        arr.forEach(obj=>{
          let children = obj[keyMap.childKey];
          if (Array.isArray(children) && children.length) {
            sum = this.calcMeters(children, keyMap, sum);
          } else {
            sum += Number(obj['meters']);
          }
        });
        return sum;
      },
    }
  };
</script>
<style lang="less" scoped>
  .el-transfer {
    /*margin-left: 70px;*/
    /deep/ .el-transfer-panel {
      width: 282px;
    }
  }
  .transfer-footer {
    text-align: center;
    line-height: 41px;
    color: #303133;
  }
</style>
