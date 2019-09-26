/**
 * 用于固定弹框选项卡内的内容高度
 */
import { methods } from "djweb";
const { getStyle } = methods;
function getElHeight(el) {
  if (el) {
    let height = parseFloat(getStyle(el, 'height'));
    let top = parseFloat(getStyle(el, 'margin-top'));
    let bottom = parseFloat(getStyle(el, 'margin-bottom'));
    return height + top + bottom;
  }
}
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
  mounted() {
    this.fixedDialog();
  },
  methods: {
    updateContentHeight() {
      this.content_height = parseFloat(getStyle(this.scrollbarView, 'height'))
    },
    calcHeight() {
      if (!this.content_height) {
        this.updateContentHeight();
      }
      let height_v = this.content_height;
      let bottom_v = parseFloat(getStyle(this.scrollbarWrap, 'margin-bottom'));
      let maxHeight_w = parseFloat(getStyle(this.scrollbarWrap, 'max-height'));
      let height_content;
      if (maxHeight_w > height_v) {
        height_content = height_v - bottom_v;
        // this.scrollbarWrap.style.height = (height_v - bottom_v) + 'px';
      } else {
        height_content = maxHeight_w;
        // this.scrollbarWrap.style.height = maxHeight_w + 'px';
      }
      let elTabsContent = this.scrollbarView.querySelector('.el-tabs__content');
      let elTabsHeader = this.scrollbarView.querySelector('.el-tabs__header');
      elTabsContent.style.height = (height_content - getElHeight(elTabsHeader)) + 'px';
      elTabsContent.style.overflow = 'auto';
      this.scrollbarWrap.style.overflow = 'auto';
      // this.scrollbar.resize();
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
