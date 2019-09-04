<template>
  <div class="tree-check-box">
    <el-checkbox
      class="el-transfer-panel__item is-parent"
      :label="data[_keyMap.value]"
      :indeterminate="isIndeterminate"
      :disabled="data[_keyMap.disabled]"
      :key="data[_keyMap.value]"
      @change="allCheck">
      <i v-if="hasChildren" :class="['el-icon-arrow-right', isExpend ? 'is-expend' : '']" @click.stop.prevent="isExpend = !isExpend"></i>
      <span>门幅{{data[paperKeys.paperSize]}}</span>
      <span class="fr">共{{children.reduce((sum, obj)=>{
        sum += obj['meters'];
        return sum;
        }, 0)}}m</span>
    </el-checkbox>
    <el-checkbox
      v-if="hasChildren && isExpend"
      class="el-transfer-panel__item"
      :label="item[_keyMap.value]"
      :disabled="item[_keyMap.disabled]"
      :key="item[_keyMap.value]"
      @change="handleChildCheck"
      v-for="item in children">
      <i :class="['el-icon-arrow-right', 'is-leaf']"></i>
      <span>材质{{item[orderKeys.materialCode]}}</span>
      <span class="fr">{{item['meters']}}m</span>
    </el-checkbox>
  </div>
</template>
<script>
  import { orderKeys, paperKeys } from "../../../../utils/system/constant/dataKeys";
  function removeRepeat(arr) {
    return Array.from(new Set(arr));
  }
  const KEY_MAP = {
    value: 'value',
    label: 'label',
    disabled: 'disabled',
    childKey: 'children'
  };
  export default {
    name: 'treeCheckBox',
    props: {
      renderContent: {
        type: Object,
      },
      data: {
        type: Object,
        default: () => ({})
      },
      keyMap: {
        type: Object,
        default: () => ({})
      }
    },
    computed: {
      _keyMap() {
        return Object.assign({}, KEY_MAP, this.keyMap);
      },
      children() {
        return this.data[this._keyMap.childKey] || [];
      },
      isIndeterminate() {
        let checkChildValue_arr = this.childValue_arr.filter(val=>this.checkList.includes(val));
        return Boolean(checkChildValue_arr.length && checkChildValue_arr.length < this.childValue_arr.length);
      },
      hasChildren() {
        return this.children.length;
      },
      checkboxGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElCheckboxGroup') {
            parent = parent.$parent;
          } else {
            return parent;
          }
        }
      },
      checkList() {
        return this.checkboxGroup ? this.checkboxGroup.value :[];
      },
      childValue_arr() {
        return this.data[this._keyMap.childKey].map(obj=>obj[this._keyMap.value]);
      },
      // isAllCheck() {
      //   let checkChildValue_arr = this.childValue_arr.filter(val=>this.checkList.includes(val));
      //   return checkChildValue_arr.length === this.childValue_arr.length;
      // },
      hasCheck() {
        // let checkChildValue_arr = this.childValue_arr.some(val=>this.checkList.includes(val));
        return this.childValue_arr.some(val=>this.checkList.includes(val));
      },
      // checkNumber() {
      //   // let checkChildValue_arr = this.childValue_arr.some(val=>this.checkList.includes(val));
      //   return this.childValue_arr.filter(val=>this.checkList.includes(val)).length;
      // },
    },
    data: function () {
      return {
        orderKeys,
        paperKeys,
        isExpend: false
      };
    },
    created() {
    },
    methods: {
      handleChildCheck(bool) {
        this.$nextTick(()=>{
          if (bool) {
            if (!this.checkList.includes(this.data[this._keyMap.value])) {
              this.checkboxGroup.$emit('input', [...this.checkList, this.data[this._keyMap.value]]);
            }
            // if (this.isAllCheck) {
            //   // this.$emit('input', [...this.checkList, this.data[this._keyMap.value]]);
            //   this.checkboxGroup.$emit('input', [...this.checkList, this.data[this._keyMap.value]]);
            // }
          } else {
            // this.$emit('input', this.checkList.filter(val=>val !== this.data[this._keyMap.value]));
            if (!this.hasCheck) {
              this.checkboxGroup.$emit('input', this.checkList.filter(val=>val !== this.data[this._keyMap.value]));
            }
          }
        });
      },
      allCheck(bool) {
        this.$nextTick(()=>{
          if (this.hasChildren) {
            // console.log(this.checkboxGroup.$parent);
            if (this.isIndeterminate || !this.isIndeterminate && bool) {
              // this.$emit('input',  [...this.checkList, ...this.childValue_arr]);
              this.checkboxGroup.$emit('input', removeRepeat([...this.checkList, ...this.childValue_arr, this.data[this._keyMap.value]]));
            } else {
              // this.$emit('input', this.checkList.filter(val=>!this.childValue_arr.includes(val)));
              this.checkboxGroup.$emit('input', removeRepeat(this.checkList.filter(val=>![...this.childValue_arr, this.data[this._keyMap.value]].includes(val))));
            }
          }
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .el-checkbox {
    display: block;
    padding-right: 31px;
    margin-right: 0;
    .el-checkbox__label .el-icon-arrow-right {
      margin-right: 14px;
    }
  }
  .el-transfer-panel__item.is-parent {
    color: #303133;
  }
  .el-icon-arrow-right {
    transition: 0.2s;
    &.is-leaf {
      color: transparent;
      cursor: default;
    }
    &.is-expend {
      transform: rotate(90deg);
    }
  }

</style>
