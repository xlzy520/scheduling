export default {
  render(h) {
    let {row, index, col, reg} = this;
    const input = (val) => {
      if (reg && reg.test(val) || !reg) {
        this.$set(row, col.prop, val);
        this.$emit('input', val, {row, index, col, reg});
      }
    };
    const keyup = (e) => {
      if (e.keyCode === 13 || e.keyCode === 108) {
        if (this.beforeEnter) {
          this.beforeEnter(e.target.value, () => this.focus(index, col.prop), {row, index, col, ...this.$attrs});
        } else {
          this.focus(index, col.prop);
        }
      }
    };
    return h(this.service ? 'el-autocomplete' : 'dj-input', {
      ref: 'input',
      props: {
        value: row[col.prop],
        fetchSuggestions: (val, cb) => this.service(val, cb, {row, index, col, ...this.$attrs}),
        valueKey: col.prop,
        placeholder: "请输入",
        reg: this.reg,
        ...this.$attrs
      },
      nativeOn: {keyup},
      on: {input}
    });
    // return (
    //   <el-autocomplete ref="input"
    //                    value={row[col.prop]}
    //                    fetch-suggestions={(val, cb) => this.service(val, cb, {row, index, col, ...this.$attrs})}
    //                    value-key={col.prop}
    //                    placeholder="请输入"
    //                    nativeOn-keyup={keyup}
    //                    on-input={input}></el-autocomplete>
    // );
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
  props: ['row', 'index', 'col', 'service', 'beforeEnter', 'reg'],
  methods: {
    focus(index, prop) {
      let _index = index;
      let arr = Array.from(this.$parent.inputKeys);
      let map = this.keyMap;
      if (prop === arr[arr.length - 1]) {
        index++;
      }
      this.service && this.$parent.inputMap[`${_index}-${prop}`] && this.$parent.inputMap[`${_index}-${prop}`].$refs.input.close();
      this.$parent.inputMap[`${index}-${map[prop]}`] && this.$parent.inputMap[`${index}-${map[prop]}`].$el.querySelector('input').focus();
    }
  }
};
