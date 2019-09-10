<template>
  <div class="tree-transfer el-transfer">
    <transfer-panel ref="panel_left" :keyMap="_keyMap" :data="leftData" :title="titles[0]" @change="handleLeftSelection">
      <template v-if="$scopedSlots['left-footer']" slot="footer">
        <slot name="left-footer" :list="leftData" :checkList="getCheckList(false)" :keyMap="_keyMap"></slot>
      </template>
      <template v-if="$scopedSlots.parent"  slot="parent" slot-scope="props">
        <slot v-bind="props" name="parent"></slot>
      </template>
      <template v-if="$scopedSlots.children"  slot="children" slot-scope="props">
        <slot v-bind="props" name="children"></slot>
      </template>
    </transfer-panel>
    <div class="el-transfer__buttons">
      <p><i class="el-icon-arrow-left" @click="toLeft"></i></p>
      <p><i class="el-icon-arrow-right" @click="toRight"></i></p>
    </div>
    <transfer-panel ref="panel_right" :keyMap="_keyMap" :data="rightData" :title="titles[1]" @change="handleRightSelection">
      <template v-if="$scopedSlots['right-footer']" slot="footer">
        <slot name="right-footer" :list="rightData" :checkList="getCheckList(true)" :keyMap="_keyMap"></slot>
      </template>
      <template v-if="$scopedSlots.parent"  slot="parent" slot-scope="props">
        <slot v-bind="props" name="parent"></slot>
      </template>
      <template v-if="$scopedSlots.children"  slot="children" slot-scope="props">
        <slot v-bind="props" name="children"></slot>
      </template>
    </transfer-panel>
  </div>
</template>
<script>
  import transferPanel from './transfer-panel';
  import Emitter from 'element-ui/src/mixins/emitter';
  function filterData(arr = [], filterValue_arr, keyMap) {
    let result = [];
    arr.forEach(obj=>{
      let _obj = {...obj};
      if (filterValue_arr.includes(obj[keyMap.value])) {
        result.push(_obj);
        if (Array.isArray(_obj[keyMap.childKey]) && _obj[keyMap.childKey].length) {
          _obj[keyMap.childKey] = filterData(_obj[keyMap.childKey], filterValue_arr, keyMap);
        }
      }
    });
    return result
  }
  function removeRepeat(arr) {
    return Array.from(new Set(arr));
  }
  function getDataMap(data = [], keyMap, parent,  map = {}) {
    data.forEach(obj=>{
      let _obj = {...obj, parent};
      map[_obj[keyMap.value]] = _obj;
      if (Array.isArray(_obj[keyMap.childKey]) && _obj[keyMap.childKey].length) {
        getDataMap(_obj[keyMap.childKey], keyMap, _obj, map);
      }
    });
    return map
  }
  function addParentValue(list, dataMap, keyMap) {
    return removeRepeat(list.reduce((arr, val)=>{
      let obj = dataMap[val];
      let parent = obj.parent;
      while (parent) {
        arr.push(parent[keyMap.value]);
        parent = parent.parent;
      }
      return arr;
    }, list));
  }
  const KEY_MAP = {
    value: 'value',
    label: 'label',
    disabled: 'disabled',
    childKey: 'children'
  };
  export default {
    name: 'treeTransfer',
    mixins: [Emitter],
    props: {
      data: {
        type: Array,
        default: () => []
      },
      titles: {
        type: Array
      },
      keyMap: {
        type: Object,
        default: () => ({})
      }
    },
    data: function () {
      return {
        // leftData: [],
        // rightData: [],
        // leftList: [],
        rightList: [],
        leftCheckList: [],
        rightCheckList: []
      };
    },
    computed: {
      dataMap() {
        return getDataMap(this.data, this._keyMap);
      },
      _keyMap() {
        return Object.assign({}, KEY_MAP, this.keyMap);
      },
      leftList() {
        let list = Object.keys(this.dataMap).filter(val=>!this.rightList.includes(val));
        return addParentValue(list, this.dataMap, this._keyMap);
      },
      leftData() {
        // let data = this.$method.deepClone(this.data);
        // return filterData(this.data, this.leftList, this._keyMap);
        return filterData(this.data, this.leftList, this._keyMap);
      },
      rightData() {
        // let data = this.$method.deepClone(this.data);
        return filterData(this.data, this.rightList, this._keyMap);
        // return this.data;
      }
    },
    created() {
    },
    methods: {
      getCheckList(bool) {
        let keyList = bool ? this.rightCheckList : this.leftCheckList;
        return keyList.reduce((arr, key)=>{
          let obj = this.dataMap[key];
          let children = obj[this._keyMap.childKey];
          if (!(Array.isArray(children) && children.length)) {
            arr.push(obj);
          }
          return arr;
        }, []);
      },
      handleLeftSelection(selection) {
        this.leftCheckList = selection;
      },
      handleRightSelection(selection) {
        this.rightCheckList = selection;
      },
      toRight() {
        if (this.leftCheckList.length) {
          this.rightList = removeRepeat([...this.rightList, ...this.leftCheckList]);
          this.leftCheckList = [];
          this.$refs.panel_left.setCheckList(this.leftCheckList);
          this.change();
        }
      },
      toLeft() {
        if (this.rightCheckList.length) {
          this.rightList = addParentValue(this.rightList.filter(val=>!this.rightCheckList.includes(val)), this.dataMap, this._keyMap);
          this.rightCheckList = [];
          this.$refs.panel_right.setCheckList(this.leftCheckList);
          this.change();
        }
      },
      change() {
        this.dispatch('ElFormItem', 'el.form.change', [...this.rightData]);
        this.$emit('input', [...this.rightData]);
      }
    },
    components: {transferPanel}
  };
</script>
<style lang="less" scoped>
  .el-transfer__buttons {
    padding: 0 16px;
    p:not(:nth-last-of-type(1)) {
      margin-bottom: 38px;
    }
    > p >i {
      font-size: 24px;
      &:hover {
        color: #3654ea;
      }
    }
  }
</style>
