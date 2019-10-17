import baseService from './base/base';
import config from './modelConfig.js';
// const envConfig = require('../../../config');
module.exports = config.reduce((sum, item) => {
  sum[item.name] = baseService(window.globalVariable.projectID + item.url);
  return sum;
}, {});
