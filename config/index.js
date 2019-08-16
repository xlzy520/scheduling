module.exports = {
  // PROJECTID: (() => {
  //   // 后续若有其他特殊修改，可以通过当前函数来兼容，环境变量文件可以不用创建多个
  //   return process.env.VUE_APP_PROJECT_NAME || (console.error("请补充环境信息 projectId"), '');
  // })(),
  PROJECTID: (() => {
    // 后续若有其他特殊修改，可以通过当前函数来兼容，环境变量文件可以不用创建多个
    let _projectId = process.env.VUE_APP_PROJECT_NAME;
    if (!_projectId) {
      console.error("请补充环境信息 VUE_APP_PROJECT_NAME");
    }
    return _projectId;
  })()
};
