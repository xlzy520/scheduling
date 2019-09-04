<template>
  <div class="el-transfer-panel">
    <div class="el-transfer-panel__header">
      <el-checkbox
        :value="allChecked"
        @change="handleAllCheckedChange"
        :indeterminate="isHeaderIndeterminate">
        {{ title }}
        <!--<span>{{ checkedSummary }}</span>-->
      </el-checkbox>
    </div>
    <div class="el-transfer-panel__body">
      <el-checkbox-group
        v-model="checkedList"
        v-show="data.length > 0"
        class="el-transfer-panel__list">
        <tree-check-box :keyMap="_keyMap" :data="item" v-for="item in data" :key="item[_keyMap.value]" v-on="$listeners"></tree-check-box>
        <!--<el-checkbox-->
          <!--class="el-transfer-panel__item"-->
          <!--:label="item[_keyMap.value]"-->
          <!--:disabled="item[_keyMap.disabled]"-->
          <!--:key="item[_keyMap.value]"-->
          <!--v-for="item in allData">-->
          <!--{{item[_keyMap.label]}}-->
        <!--</el-checkbox>-->
      </el-checkbox-group>
    </div>
    <div class="el-transfer-panel__footer" v-if="$slots.default">
      <slot></slot>
    </div>
  </div>
</template>
<script>
  import treeCheckBox from './treeCheckBox';
  const KEY_MAP = {
    value: 'value',
    label: 'label',
    disabled: 'disabled',
    childKey: 'children'
  };
  export default {
    name: 'transfer-panel',
    props: {
      // value: {
      //   type: Array,
      //   default: ()=>[]
      // },
      data: {
        type: Array,
        default: () => []
      },
      title: {
        type: String
      },
      keyMap: {
        type: Object,
        default: () => ({})
      }
    },
    data: function () {
      return {
        // allChecked: false,
        checkedList: []
      };
    },
    computed: {
      allData() {
        return this.data.reduce((arr, obj)=>{
          arr.push(obj);
          if (Array.isArray(obj[this._keyMap.childKey])) {
            arr.push(...obj[this._keyMap.childKey]);
          }
          return arr;
        }, []);
      },
      _keyMap() {
        return Object.assign({}, KEY_MAP, this.keyMap);
      },
      isHeaderIndeterminate() {
        return Boolean(this.checkedList.length && this.allData.length > this.checkedList.length);
      },
      allChecked() {
        return this.checkedList.length === this.allData.length && this.allData.length !== 0;
      }
    },
    created() {
    },
    methods: {
      setCheckList(list) {
        this.checkedList = list;
      },
      //全选
      handleAllCheckedChange(bool) {
        if (bool) {
          this.checkedList = [...this.allData.map(obj=>obj[this._keyMap.value])];
          // this.$emit('input', [...this.allData.map(obj=>obj[this._keyMap.value])]);
        } else {
          this.checkedList = [];
          // this.$emit('input', []);
        }
      }
    },
    watch: {
      checkedList(arr) {
        // if (arr.length === this.allData.length) {
        //   this.allChecked = true;
        // } else {
        //   this.allChecked = false;
        // }
        this.$emit('change', arr);
      },
      // value(arr) {
      //   if (arr.length === this.allData.length) {
      //     this.allChecked = true;
      //   } else {
      //     this.allChecked = false;
      //   }
      //   this.$emit('change', arr);
      // }
    },
    components: {treeCheckBox}
  };
</script>
<style lang="less" scoped>
.el-checkbox-group, .tree-check-box {
  display: block;
}
/deep/ .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  &:before {
    top: 5px;
    left: 0;
    width: auto;
  }
}
.el-transfer-panel /deep/ .el-checkbox__inner:after {
  top: 2px;
}
.el-transfer-panel__footer {
  background-color: rgb(245, 247, 250);
}
</style>
