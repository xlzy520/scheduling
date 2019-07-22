import base from './base/base';
import config from './modelConfig.js';

module.exports = config.reduce((sum, item) => {
  sum[item.name] = base(item.url);
  return sum;
}, {});
