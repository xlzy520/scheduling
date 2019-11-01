<template>
  <table-controls-box v-model="isShow" :disabled="disabled" :label="row[col.prop]" @focus="changeState(true)">
    <div v-clickoutside="handleBlur">
      <el-autocomplete ref="input"
                       v-if="service"
                       :fetch-suggestions="(val, cb) => service(val, cb, {row, index, col, ...$attrs})"
                       trigger-on-focus
                       :value-key="col.prop"
                       :disabled="disabled"
                       v-bind="getBind()"
                       @select="select"
                       @input="input"></el-autocomplete>
      <dj-input ref="input" v-if="!service" v-bind="getBind()" @input="input"></dj-input>
    </div>
  </table-controls-box>
</template>
<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  import tableControlsBox from './tableControlsBox';
  import shortCut from './shortCut';
  export default {
    name: 'tableInput',
    components: {tableControlsBox},
    directives: { Clickoutside },
    mixins: [shortCut],
    props: {
      row: {},
      index: {},
      col: {},
      service: {},
      disabled: {},
      beforeInput: {
        type: Function
      },
    },
    data: function () {
      return {
        isShow: false
      };
    },
    created() {
      this.setFocus(this.focus);
    },
    methods: {
      focus() {
        console.log(this.$refs.input);
        this.$refs.input.$el.querySelector('input').focus({
          preventScroll: true
        });
      },
      input(val) {
        // if (this.reg && this.reg.test(val) || !this.reg) {
          let {row, index, col, reg} = this;
          let oldValue = row[col.prop];
          if (this.beforeInput) {
            val = this.beforeInput(val, oldValue, this);
          }
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
      handleBlur(e) {
        this.changeState(false);
      }
    }
  };
</script>
