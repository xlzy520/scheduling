/**
 * 用于固定弹框内容高度
 */
export default {
  data() {
    return {
      // max_map: {},
      content_height: undefined,
      scrollbar: undefined,
      scrollbarWrap: undefined,
      scrollbarView: undefined
    }
  },
  methods: {
    updateContentHeight() {
      this.content_height = parseFloat(this.$method.getStyle(this.scrollbarView, 'height'))
    },
    calcHeight() {
      if (!this.content_height) {
        this.updateContentHeight();
      }
      let height_v = this.content_height;
      let bottom_v = parseFloat(this.$method.getStyle(this.scrollbarWrap, 'margin-bottom'));
      let maxHeight_w = parseFloat(this.$method.getStyle(this.scrollbarWrap, 'max-height'));
      if (maxHeight_w > height_v) {
        this.scrollbarWrap.style.height = (height_v - bottom_v) + 'px';
      } else {
        this.scrollbarWrap.style.height = maxHeight_w + 'px';
      }
      this.scrollbar.resize();
    },
    fixedDialog() {
      setTimeout(() => {
        this.scrollbar = this.$children[0].$children[0].$children.filter(obj => obj.$options._componentTag === 'dj-scroll-box')[0];
        this.scrollbarWrap = this.scrollbar.$el.querySelector('.el-scrollbar__wrap');
        this.scrollbarView = this.scrollbar.$el.querySelector('.el-scrollbar__view');
        this.calcHeight();
        this.addListener(window, 'resize', this.calcHeight, 500);
      });
    },
  }
};
