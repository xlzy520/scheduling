//路由懒加载方法
module.exports = (file, name) => () => {
  let com = import('@/' + file + '.vue');
  return com.then(res=>{
    name && (res.default.name = name); //重新配置name，防止出现路由name与组件name不符导致无法缓存页面的问题
    return res;
  });
};
