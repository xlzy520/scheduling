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
      scrollbarView: undefined,
      elTabsContent: undefined,
      elTabsHeader: undefined,
    }
  },
  mounted() {
    this.fixedDialog();
  },
  methods: {
    updateContentHeight() {
      this.content_height = Array.prototype.reduce.call(this.elTabsContent.childNodes, (max, div)=>{
        let h = getElHeight(div);
        return h > max ? h : max;
      }, 0) + getElHeight(this.elTabsHeader);
      // this.content_height = parseFloat(getStyle(this.scrollbarView, 'height'))
    },
    calcHeight() {
      if (!this.content_height) {
        this.updateContentHeight();
      }
      let height_v = this.content_height;
      let bottom_v = Math.abs(parseFloat(getStyle(this.scrollbarWrap, 'margin-bottom')));
      let maxHeight_w = parseFloat(getStyle(this.scrollbarWrap, 'max-height'));
      let height_content;
      if (maxHeight_w > height_v) {
        height_content = height_v;
        // this.scrollbarWrap.style.height = (height_v - bottom_v) + 'px';
      } else {
        height_content = maxHeight_w - bottom_v;
        // this.scrollbarWrap.style.height = maxHeight_w + 'px';
      }
      this.elTabsContent.style.height = (height_content - getElHeight(this.elTabsHeader)) + 'px';
      this.elTabsContent.style.overflow = 'auto';
      // elTabsContent.style.marginBottom = Math.abs(bottom_v) + 'px';
      // this.scrollbarWrap.style.overflow = 'auto';
      // this.scrollbar.resize();
    },
    fixedDialog() {
      setTimeout(() => {
        this.scrollbar = this.$children[0].$children[0].$children.filter(obj => obj.$options._componentTag === 'dj-scroll-box')[0];
        this.scrollbarWrap = this.scrollbar.$el.querySelector('.el-scrollbar__wrap');
        this.scrollbarView = this.scrollbar.$el.querySelector('.el-scrollbar__view');
        this.elTabsContent = this.scrollbarView.querySelector('.el-tabs__content');
        this.elTabsHeader = this.scrollbarView.querySelector('.el-tabs__header');
        this.calcHeight();
        this.addListener(window, 'resize', this.calcHeight, 500);
      });
    },
  }
};
