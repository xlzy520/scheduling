import main from './src/main.vue';

main.install = function (Vue) {
  Vue.component(main.name, main);
};

export default main;
