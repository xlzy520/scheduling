<template>
  <table-controls-box v-model="isShow" :disabled="disabled" :label="row[labelKey || col.prop]" @focus="changeState(true)">
    <div v-clickoutside="handleBlur">
      <dj-select ref="select"
                 :options="_options"
                 :key-map="keyMap"
                 :value="row[col.prop]"
                 placeholder="请选择"
                 :disabled="disabled"
                 @input="input"
      ></dj-select>
    </div>
  </table-controls-box>
</template>
<script>
  import shortCut from './shortCut';
  import tableControlsBox from './tableControlsBox';
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  export default {
    name: 'tableSelect',
    components: {tableControlsBox},
    directives: { Clickoutside },
    mixins: [shortCut],
    props: {
      keyMap: {
        type: Object,
        default: ()=>({})
      },
      options: {},
      disabled: {},
      row: {},
      index: {},
      col: {},
      labelKey: {},
      service: {},
      linkKey: {},
      beforeInput: {
        type: Function
      },
    },
    computed: {
      _options() {
        return this.service ? this.realOptions : this.options;
      },
    },
    data: function () {
      return {
        realOptions: []
      };
    },
    created() {
      this.setFocus(this.focus);
    },
    mounted() {
      // if (Array.isArray(this.linkKey) && this.linkKey.length) {
      //   this.linkKey.forEach((key)=>{
      //     this.$watch(`row.${key}`, (val)=>this.getOptions(val, key));
      //     this.getOptions(this.row[key], key);
      //   });
      // }
    },
    methods: {
      getOptions(val, key) {
        if (![null, undefined, ''].includes(val)) {
          this.service(val, key).then(res=>{
            this.realOptions = res;
          });
        } else {
          this.realOptions = [];
        }
      },
      focus() {
        if (Array.isArray(this.realOptions) && this.realOptions.length) {
          this.realOptions = [];
        }
        if (Array.isArray(this.linkKey) && this.linkKey.length) {
          this.linkKey.forEach((key)=>{
            this.getOptions(this.row[key], key);
          });
        }
        this.$refs.select.$children[0].toggleMenu();
      },
      input(val) {
        // if (this.reg && this.reg.test(val) || !this.reg) {
          let {row, index, col, reg} = this;
          let oldValue = row[col.prop];
          if (this.beforeInput) {
            val = this.beforeInput(val, oldValue, this);
          }
          this.$set(row, this.col.prop, val);
          this.labelKey && this.$set(row, this.labelKey, (this._options.filter(obj=>val === obj[this.keyMap.value || 'value'])[0] || {})[this.keyMap.label || 'label']);
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
      handleBlur() {
        this.changeState(false);
      }
    }
  };
</script>
