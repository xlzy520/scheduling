<template>
  <div class="tags-view-container">
    <dj-scroll-box ref="scrollPane" class="tags-view-wrapper" @wheel.native.prevent="handleScroll">
      <div class="tags-view-container-content">
        <router-link
          v-for="tag in visitedViews"
          ref="tag"
          :class="isActive(tag)?'active':''"
          :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
          :key="tag.path"
          tag="span"
          class="tags-view-item"
          @click.middle.native="closeTag(tag)"
          @contextmenu.prevent.native="judgeClose(tag) && openMenu(tag,$event)">
          {{ tag.title }}
          <span v-if="judgeClose(tag)" class="el-icon-close" @click.prevent.stop="judgeClose(tag)&&closeTag(tag)"/>
        </router-link>
      </div>
    </dj-scroll-box>
    <ul v-show="isShowMenu" :style="{left:menu_left+'px',top:menu_top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li @click="closeSelectedTag(selectedTag)">关闭标签</li>
      <li @click="closeOthersTags">关闭其他标签</li>
      <li @click="closeAllTags">关闭所有标签</li>
    </ul>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
    data() {
      return {
        isShowMenu: false,
        selectedTag: undefined,
        menu_top: undefined,
        menu_left: undefined
      };
    },
    computed: {
      ...mapGetters([
        'visitedViews'
      ])
    },
    watch: {
      $route() {
        this.addViewTags();
        this.moveToCurrentTag();
        this.updateScroll();
      },
      isShowMenu(value) {
        if (value) {
          document.body.addEventListener('click', this.closeMenu);
        } else {
          document.body.removeEventListener('click', this.closeMenu);
        }
      }
    },
    mounted() {
      this.addViewTags();
      this.moveToCurrentTag();
    },
    methods: {
      closeMenu() {
        this.isShowMenu = false;
      },
      openMenu(tag, e) {
        const menuMinWidth = 105;
        // console.log(this.$el.getBoundingClientRect());
        const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
        const offsetTop = this.$el.getBoundingClientRect().top; // container margin left
        const offsetWidth = this.$el.offsetWidth; // container width
        const maxLeft = offsetWidth - menuMinWidth; // left boundary
        const left = e.clientX - offsetLeft + 15; // 15: margin right

        if (left > maxLeft) {
          this.menu_left = maxLeft;
        } else {
          this.menu_left = left;
        }
        this.menu_top = e.clientY - offsetTop;

        this.isShowMenu = true;
        this.selectedTag = tag;
      },
      refreshSelectedTag() {
        this.$store.dispatch('delCachedView', this.selectedTag).then(()=>{
          this.isActive(this.selectedTag) && this.$emit('refresh');
          this.$nextTick(()=>{
            this.$store.dispatch('addCachedView', this.selectedTag);
          });
        });
      },
      closeSelectedTag() {
        this.closeTag(this.selectedTag);
      },
      closeOthersTags() {
        this.$router.push(this.selectedTag);
        this.$store.dispatch('delOthersViews', this.selectedTag).then(() => {
          this.moveToCurrentTag();
        });
      },
      closeAllTags() {
        this.$store.dispatch('delAllViews').then(()=>{
          this.$router.push('/home');
        });
      },
      judgeClose(tag) {
        return !(this.visitedViews.length === 1 && tag.isHome);
      },
      updateScroll() {
        this.$nextTick(() => {
          this.$refs.scrollPane.$refs.scrollbar.update();
        });
      },
      handleScroll(e) {
        const eventDelta = e.wheelDelta || -e.deltaY * 40;
        const $scrollWrapper = this.$refs.scrollPane.$refs.scrollbar.$refs.wrap;
        $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft - eventDelta / 4;
      },
      isActive(route) {
        return route.path === this.$route.path;
      },
      addViewTags() {
        if (this.$route.name) {
          this.$store.dispatch('addVisitedViews', this.$route);
        }
      },
      moveToCurrentTag() {
        const tags = this.$refs.tag || [];
        this.$nextTick(() => {
          for (const tag of tags) {
            if (tag.to.path === this.$route.path) {
              this.$refs.scrollPane.moveToTarget(tag.$el);
              break;
            }
          }
        });
      },
      closeTag(view) {
        if (!this.judgeClose(view)) return;
        const isCurrentView = view.path === this.$route.path;
        this.$store.dispatch('delVisitedViews', view).then(() => {
          if (isCurrentView) {
            let length = this.visitedViews.length;
            if (length) {
              this.$router.push(this.visitedViews[length - 1].path);
            } else {
              this.$router.push('/home');
            }
          }
          this.updateScroll();
        });
      }
    }
  };
</script>

<style lang="less" scoped>
@deep: ~'>>>';
.tags-view-container {
  position: relative;
  z-index: 101;
  height: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  .tags-view-wrapper {
    padding-bottom: 1px;
    white-space: nowrap;
  }
  &-content {
    padding: 5px 0;
    .tags-view-item {
      position: relative;
      display: inline-block;
      height: 26px;
      padding: 0 8px;
      margin-top: 4px;
      margin-left: 5px;
      font-size: 12px;
      line-height: 26px;
      color: #495060;
      cursor: pointer;
      background: #fff;
      border: 1px solid #d8dce5;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        color: #fff;
        background-color: #42b983;
        border-color: #42b983;
        &::before {
          position: relative;
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 2px;
          background: #fff;
          border-radius: 50%;
          content: '';
        }
      }
      .el-icon-close {
        width: 16px;
        height: 16px;
        text-align: center;
        vertical-align: 2px;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        transform-origin: 100% 50%;
        &::before {
          display: inline-block;
          vertical-align: -3px;
          transform: scale(0.6);
        }
        &:hover {
          color: #fff;
          background-color: #b4bccc;
        }
      }
    }
  }
  .contextmenu {
    position: absolute;
    z-index: 100;
    padding: 5px 0;
    margin: 0;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    list-style-type: none;
    background: #fff;
    border-radius: 4px;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      padding: 7px 16px;
      margin: 0;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
@{deep} .el-scrollbar__wrap {
  width: 100%; //ie浏览器兼容，解决在ie10浏览器下el-scrollbar__wrap的宽度加了17px的问题
  overflow-y: auto; //ie兼容，解决ie上会出现默认浏览器滚动条的问题
}
</style>
