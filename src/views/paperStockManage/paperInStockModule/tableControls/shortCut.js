export default {
  props: {
    row: {},
    disabled: {},
    index: {},
    col: {},
    beforeEnter: {},
    disabledShortcut: {
      type: Array,
      default: ()=>[]
    },
  },
  data: function () {
    return {
      isShow: false,
      hiddening: false,
      focusFn: undefined
    };
  },
  computed: {
    // isTarget() {
    //   return this.$parent.focusKey === `${this.index}-${this.col.prop}`;
    // },
    propMap() {
      let arr = Array.from(this.$parent.inputKeys);
      return arr.reduce((map, str, index) => {
        if (index === arr.length - 1) {
          map[str] = arr[0];
        } else {
          map[str] = arr[index + 1];
        }
        return map;
      }, {});
    },
    tableBody() {
      return this.$parent;
    }
  },
  created() {
    if (!this.tableBody.isOnScroll) {
      // console.log('$watch');
      this.tableBody.isOnScroll = true;
      this.tableBody.$watch('store.states.indexList', ()=>{
        let {focusKey, inputMap} = this.tableBody;
        // console.log('focusKey', focusKey);
        if (focusKey && inputMap[focusKey]) {
          let target = inputMap[focusKey];
          target.changeState(true);
        }
      })
    }
  },
  mounted() {
    if (!this.$parent.fixed) {
      if (!this.$parent.inputMap) {
        this.$parent.inputMap = {};
        this.$parent.inputKeys = new Set();
      }
      this.$parent.inputMap[`${this.index}-${this.col.prop}`] = this;
      this.$parent.inputKeys.add(this.col.prop);
      if (this.$parent.focusKey === `${this.index}-${this.col.prop}`) {
        this.changeState(true);
      }
    }
  },
  destroyed() {
    if (!this.$parent.fixed) {
      this.$parent.inputMap[`${this.index}-${this.col.prop}`] = undefined;
    }
  },
  methods: {
    setFocus(fn) {
      this.focusFn = fn;
    },
    changeState(bool) {
      if (bool) {
        if (!this.disabled) {
          // this.tableBody.focusKey = `${this.index}-${this.col.prop}`;
          this.isShow = bool;
          this.setFocusKey(`${this.index}-${this.col.prop}`);
          this.hiddening = false;
          this.$nextTick(()=>{
            this.focusFn && this.focusFn();
            this.addListener(window, 'keyup', this.handleKeyUp);
          });
        }
      } else {
        this.removeListener(window, 'keyup', this.handleKeyUp);
        this.hiddening = true;
        setTimeout(()=>{
          // this.$nextTick(()=>{
            if (this.hiddening) {
              this.isShow = bool;
              this.setFocusKey();
              this.hiddening = false;
            }
          // });
        });
      }
    },
    handleKeyUp (e) {
      let {row, index, col} = this;
      let map = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
      };
      if (e.keyCode === 13 || e.keyCode === 108) {
        if (this.beforeEnter) {
          this.beforeEnter(e.target.value, () => this.shortCutFocus(index, col.prop), {row, index, col, ...this.$attrs});
        } else {
          this.shortCutFocus(index, col.prop);
        }
      }
      if (map[e.keyCode]) {
        this.shortCutFocus(index, col.prop, map[e.keyCode]);
      }
    },
    getFocusTarget(index, prop, arrow = 'right') {
      if (this.disabledShortcut.includes(arrow)) {
        return;
      }
      let arr = Array.from(this.$parent.inputKeys);
      let map = this.propMap;
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
      if (index >= this.tableBody.data.length || index < 0) {
        return;
      }
      let target = this.$parent.inputMap[`${index}-${willGoProp}`];
      if (target.disabled) {
        return this.getFocusTarget(index, willGoProp, arrow);
      } else {
        return target;
      }
    },
    shortCutFocus(index, prop, arrow = 'right') {
      // if (this.disabledShortcut.includes(arrow)) {
      //   return;
      // }
      // let arr = Array.from(this.$parent.inputKeys);
      // let map = this.propMap;
      // let willGoProp = prop;
      // if (arrow === 'left') {
      //   let _map = {};
      //   Object.keys(map).forEach(key=>{
      //     _map[map[key]] = key;
      //   });
      //   map = _map;
      // }
      // if (['left', 'right'].includes(arrow)) {
      //   willGoProp = map[prop];
      // }
      // if (arrow === 'down' || (arrow === 'right' && prop === arr[arr.length - 1])) {
      //   index++;
      // }
      // if (arrow === 'up' || (arrow === 'left' && prop === arr[0])) {
      //   index--;
      // }
      // let target = this.$parent.inputMap[`${index}-${willGoProp}`];
      let target = this.getFocusTarget(index, prop, arrow);
      if (target) {
        // this.setFocusKey(`${index}-${willGoProp}`);
        let cell_rect = target.$el.getBoundingClientRect();
        let wrap = this.$parent.$parent.$el.querySelector('.el-table__body-wrapper');
        let wrap_rect = wrap.getBoundingClientRect();
        if (wrap_rect.top > cell_rect.top) {
          // wrap.scrollTop -= this.$parent.rowHeight;
          wrap.scrollTop = this.tableBody.rowHeight * target.index;
          target.changeState(true);
        } else if (wrap_rect.bottom < cell_rect.bottom) {
          // let scrollTop = wrap.scrollTop + this.$parent.rowHeight;
          let scrollTop = (this.tableBody.rowHeight * (target.index + 1)) - wrap.clientHeight;
          console.log(scrollTop);
          if (this.judgeIndexListChange(scrollTop)) {
            wrap.scrollTop = scrollTop;
            setTimeout(()=>{
              this.$nextTick(()=>{
                target.changeState(true);
              });
            });
          } else {
            wrap.scrollTop = scrollTop;
            target.changeState(true);
          }
        } else {
          target.changeState(true);
        }
        this.changeState(false);
      }
    },
    judgeIndexListChange(scrollTop) {
      let {startIndex, totalRowNum, rowHeight, visualHeight} = this.$parent;
      return (startIndex + totalRowNum) * rowHeight <= scrollTop + visualHeight || scrollTop <= (startIndex + 2) * rowHeight;
    },
    setFocusKey(key) {
      this.tableBody.focusKey = key;
    }
  },
  // watch: {
  //   '$parent.store.states.indexList': function() {
  //     if (this.tableBody.focusKey === `${this.index}-${this.col.prop}`) {
  //       this.changeState(true);
  //     }
  //   }
  // }
};
