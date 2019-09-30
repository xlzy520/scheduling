import pagePane from './pagePane';
import singlePage from './singlePage';
let components = [pagePane, singlePage];
components.forEach(com=>{
  com.install = function (Vue) {
    Vue.component(com.name, com);
  };
});
export default {
  pagePane,
  singlePage,
  install(Vue) {
    components.forEach(com=>{
      Vue.use(com);
    });
  }
};
