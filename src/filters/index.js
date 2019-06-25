const filters = {};

filters.install = function(Vue) {
  Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key]);
  });
};

export default filters;
