import djproject from './base/djproject';
import config from './modelConfig.js';

module.exports = config.reduce((sum, item) => {
  sum[item.name] = djproject(item.url);
  return sum;
}, {});
