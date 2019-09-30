<template>
  <div class="el-transfer-panel">
    <div class="el-transfer-panel__header">
      <without-form-checkbox
        :value="allChecked"
        @change="handleAllCheckedChange"
        :indeterminate="isHeaderIndeterminate">
        {{ title }}
      </without-form-checkbox>
    </div>
    <div :class="['el-transfer-panel__body', $slots.footer ? 'is-with-footer' : '']">
      <without-form-checkbox-group
        v-model="checkedList"
        v-show="data.length > 0"
        class="el-transfer-panel__list">
        <tree-check-box :key-map="_keyMap" :data="item" v-for="item in data" :key="item[_keyMap.value]"
                        v-on="$listeners">
          <template v-if="$scopedSlots.parent"  slot="parent" slot-scope="props">
            <slot v-bind="props" name="parent"></slot>
          </template>
          <template v-if="$scopedSlots.children"  slot="children" slot-scope="props">
            <slot v-bind="props" name="children"></slot>
          </template>
        </tree-check-box>
      </without-form-checkbox-group>
    </div>
    <div class="el-transfer-panel__footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
<script>
  import treeCheckBox from './treeCheckBox';
  import { withoutFormCheckbox, withoutFormCheckboxGroup } from '../../../elementUI/elementPackage';
  const KEY_MAP = {
    value: 'value',
    label: 'label',
    disabled: 'disabled',
    childKey: 'children'
  };
  export default {
    name: 'transfer-panel',
    props: {
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
        checkedList: []
      };
    },
    computed: {
      allData() {
        return this.data.reduce((arr, obj) => {
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
          this.checkedList = [...this.allData.map(obj => obj[this._keyMap.value])];
        } else {
          this.checkedList = [];
        }
      }
    },
    watch: {
      checkedList(arr) {
        this.$emit('change', arr);
      },
    },
    components: {treeCheckBox, withoutFormCheckbox, withoutFormCheckboxGroup}
  };
</script>
<style lang="less" scoped>
  .el-checkbox-group, .tree-check-box {
    display: block;
  }
  /deep/ .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    &::before {
      top: 5px;
      left: 0;
      width: auto;
    }
  }
  .el-transfer-panel /deep/ .el-checkbox__inner::after {
    top: 2px;
  }
  .el-transfer-panel__footer {
    background-color: rgb(245, 247, 250);
  }
</style>
