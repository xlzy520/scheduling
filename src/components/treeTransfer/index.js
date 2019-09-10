import main from './src/treeTransfer.vue';

main.install = function (Vue) {
  Vue.component(main.name, main);
};

export default main;
