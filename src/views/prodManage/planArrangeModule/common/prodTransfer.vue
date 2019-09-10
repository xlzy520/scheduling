<template>
  <tree-transfer :value="value" :data="data" :titles="['选择生产订单', '待更换生产订单']" @input="$listeners.input">
    <template slot="parent" slot-scope="{data}">
      <span>门幅{{data[paperKeys.paperSize]}}</span>
      <span class="fr">共
        {{
          data.children.reduce((sum, obj)=>{
            return $method.accuracyCompute(sum, obj[orderKeys.orderMetres], '+');
          }, 0)
        }}
        m</span>
    </template>
    <template slot="children" slot-scope="{data}">
      <span>材质{{data[orderKeys.produceMaterial]}}</span>
      <span class="fr">{{data['paperLength']}}m</span>
    </template>
    <div class="transfer-footer" slot="left-footer" slot-scope="{list, keyMap, checkList}">
      <span>选中订单米数：{{calcMeters(checkList, keyMap)}}米</span>
    </div>
    <div class="transfer-footer" slot="right-footer" slot-scope="{list, keyMap}">
      <span>待更换订单米数：{{calcMeters(list, keyMap)}}米</span>
    </div>
  </tree-transfer>
</template>
<script>
  import { orderKeys, paperKeys } from "../../../../utils/system/constant/dataKeys";
  import treeTransfer from '../../../../components/treeTransfer';
  export default {
    name: 'prodTransfer',
    props: {
      data: Array,
      value: Array
    },
    data: function () {
      return {
        orderKeys,
        paperKeys
      };
    },
    created() {
    },
    components: {treeTransfer},
    methods: {
      calcMeters(arr = [], keyMap, sum = 0) {
        arr.forEach(obj=>{
          let children = obj[keyMap.childKey];
          if (Array.isArray(children) && children.length) {
            sum = this.calcMeters(children, keyMap, sum);
          } else {
            sum = this.$method.accuracyCompute(sum, Number(obj[orderKeys.orderMetres]), '+');
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
