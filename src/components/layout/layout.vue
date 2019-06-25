<template>
  <div class="layout">
    <!-- <div class="layout-header">
      <first-menu></first-menu>
    </div> -->
    <div class="layout-body">
      <!-- <div class="layout-body-menu">
        <base-menu :menus="menus" @switch-menu="switchMenu"></base-menu>
      </div> -->
      <div class="layout-body-content">
        <!-- <div class="layout-body-content-tags">
          <tags-view @refresh="refresh"></tags-view>
        </div> -->
        <div class="layout-body-content-view">
          <dj-content-box>
            <keep-alive :include="cachedViews">
              <router-view :key="$route.path" v-if="isShow"></router-view>
            </keep-alive>
          </dj-content-box>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tagsView from './tagsView';
import { mapGetters } from 'vuex';

export default {
  name: 'layout',
  components: {
    tagsView,
  },
  data() {
    return {
      isShow: true
    };
  },
  computed: {
    ...mapGetters([
      'cachedViews',
      'menus'
    ])
  },
  methods: {
    refresh() {
      this.isShow = false;
      this.$nextTick(()=>{
        this.isShow = true;
      });
    },
    switchMenu(menu) {
      this.$router.push(menu.path);
    }
  },
  destroyed() {
    window.observer.remove('refresh');
  },
  mounted() {
    window.observer.on('refresh', this.refresh);
  }
};
</script>

<style lang="less" scoped>
.layout {
  height: 100%;
  &-body {
    position: relative;
    display: flex;
    height: 100%;
    &-menu {
      position: absolute;
      z-index: 200;
      height: 100%;
    }
    &-content {
      position: relative;
      display: flex;
      width: 100%;
      overflow: auto;
      flex-grow: 1;
      flex-direction: column;
      background-color: #f4f4f4;
      &-tags {
        position: relative;
        flex-shrink: 0;
        height: 45px;
      }
      &-view {
        position: relative;
        flex-grow: 1;
      }
    }
  }
}
</style>
