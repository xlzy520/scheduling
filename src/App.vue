<template>
  <div id="app">
    <router-view></router-view>
    <!--<layout></layout>-->
  </div>
</template>

<script>
// import layout from './components/layout/layout.vue';
export default {
  name: 'App',
  // components: {
  //   layout
  // }
};
</script>

<style>
#app {
  height: 100%;
  /* font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale; */
  color: #2c3e50;
  /* text-align: center; */
}
</style>
