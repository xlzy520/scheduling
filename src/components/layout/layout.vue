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
    <div class="abs-route-nav">
      <router-link :to="route.path" v-for="route in routes" :key="route.name">{{route.meta.title}}</router-link>
    </div>
  </div>
</template>

<script>
  import tagsView from './tagsView';
  import allRoutes from '../../router/permissionRouter';
  import {mapGetters} from 'vuex';
  export default {
    name: 'layout',
    components: {
      tagsView,
    },
    data() {
      return {
        isShow: true,
      };
    },
    computed: {
      ...mapGetters([
        'cachedViews',
        'menus',
      ]),
      routes() {
        function getPer(routes, menu) {
          routes.forEach(route => {
            menu.push(route);
          });
        }

        let baseRouteNameMap = ['baseSetting', 'paperStockManage', 'prodManage', 'statement'];
        console.log(allRoutes);
        let myRoutes = (baseRouteName) => allRoutes.filter(item=>
          item.name.indexOf(`${baseRouteName}`) > -1 && item.name.indexOf(`*`) < 0);
        let permissionMenu = [];
        //如果是开发者状态，获取全部权限
        if (process.env.NODE_ENV === 'development') {
          getPer(myRoutes(baseRouteNameMap[0]), permissionMenu);
          getPer(myRoutes(baseRouteNameMap[1]), permissionMenu);
          getPer(myRoutes(baseRouteNameMap[2]), permissionMenu);
          getPer(myRoutes(baseRouteNameMap[3]), permissionMenu);
        }
        return permissionMenu;
      }
    },
    methods: {
      refresh() {
        this.isShow = false;
        this.$nextTick(() => {
          this.isShow = true;
        });
      },
      switchMenu(menu) {
        this.$router.push(menu.path);
      },
    },
    // destroyed() {
    //   window.observer.remove('refresh');
    // },
    // mounted() {
    //   window.observer.on('refresh', this.refresh);
    // },
  };
</script>

<style lang="less" scoped>
  .abs-route-nav {
    background-color: #ede4f5;
    border-radius: 4px;
    position: absolute;
    top: 53px;
    z-index: 2000;
    display: flex;
    height: 50px;
    line-height: 50px;
    a {
      margin-left: 20px;
      color: deeppink;
    }
  }
  .layout {
    height: 100%;
    &-body {
      position: relative;
      display: flex;
      height: 100%;
      &-menu {
        position: absolute;
        z-index: 2000;
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
