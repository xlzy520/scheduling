<template>
  <el-autocomplete ref="input"
                   v-if="service"
                   :fetch-suggestions="(val, cb) => service(val, cb, {row, index, col, ...$attrs})"
                   trigger-on-focus
                   :value-key="col.prop"
                   v-bind="getBind()"
                   v-on:keyup.native="keyup"
                   @select="select"
                   @input="input"></el-autocomplete>
  <dj-input v-else v-bind="getBind()" v-on:keyup.native="keyup" @input="input"></dj-input>
</template>
<script>
  export default {
    name: 'tableInput',
    props: {
      row: {},
      index: {},
      col: {},
      service: {},
      beforeEnter: {},
      disabledShortcut: {
        type: Array,
        default: ()=>[]
      },
    },
    // props: ['row', 'index', 'col', 'service', 'beforeEnter', 'disabledShortcut'],
    data: function () {
      return {};
    },
    created() {
    },
    mounted() {
      if (!this.$parent.fixed) {
        if (!this.$parent.inputMap) {
          this.$parent.inputMap = {};
          this.$parent.inputKeys = new Set();
        }
        this.$parent.inputMap[`${this.index}-${this.col.prop}`] = this;
        this.$parent.inputKeys.add(this.col.prop);
      }
    },
    computed: {
      keyMap() {
        let arr = Array.from(this.$parent.inputKeys);
        return arr.reduce((map, str, index) => {
          if (index === arr.length - 1) {
            map[str] = arr[0];
          } else {
            map[str] = arr[index + 1];
          }
          return map;
        }, {});
      }
    },
    methods: {
      input(val) {
        // if (this.reg && this.reg.test(val) || !this.reg) {
          let {row, index, col, reg} = this;
          let oldValue = row[col.prop];
          this.$set(row, this.col.prop, val);
          if (val !== oldValue) {
            this.$emit('change', val, {row, index, col, reg});
          }
          this.$emit('input', val, {row, index, col, reg});
        // }
      },
      select (val) {
        let {row, index, col, reg} = this;
        this.$emit('select', val, {row, index, col, reg});
      },
      keyup (e) {
        let {row, index, col} = this;
        let map = {
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down',
        };
        if (e.keyCode === 13 || e.keyCode === 108) {
          if (this.beforeEnter) {
            this.beforeEnter(e.target.value, () => this.focus(index, col.prop), {row, index, col, ...this.$attrs});
          } else {
            this.focus(index, col.prop);
          }
        }
        if (map[e.keyCode]) {
          this.focus(index, col.prop, map[e.keyCode]);
        }
      },
      getBind() {
        return {
          value: this.row[this.col.prop],
          // fetchSuggestions: (val, cb) => this.service(val, cb),
          // triggerOnFocus: true,
          // valueKey: this.col.prop,
          placeholder: "请输入",
          // reg: this.reg,
          // disabled: this.disabled,
          ...this.$attrs
        };
      },
      focus(index, prop, arrow = 'right') {
        if (this.disabledShortcut.includes(arrow)) {
          return;
        }
        let _index = index;
        let arr = Array.from(this.$parent.inputKeys);
        let map = this.keyMap;
        let willGoProp = prop;
        if (arrow === 'left') {
          let _map = {};
          Object.keys(map).forEach(key=>{
            _map[map[key]] = key;
          });
          map = _map;
        }
        if (['left', 'right'].includes(arrow)) {
          willGoProp = map[prop];
        }
        if (arrow === 'down' || (arrow === 'right' && prop === arr[arr.length - 1])) {
          index++;
        }
        if (arrow === 'up' || (arrow === 'left' && prop === arr[0])) {
          index--;
        }
        if (this.$parent.inputMap[`${index}-${prop}`]) {
          this.service && this.$parent.inputMap[`${_index}-${prop}`] && this.$parent.inputMap[`${_index}-${prop}`].$refs.input.close();
          this.$parent.inputMap[`${index}-${willGoProp}`].$el.querySelector('input').focus();
        }
      }
    }
  };
</script>
<style lang="less" scoped>

</style>
