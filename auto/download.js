const axios = require('axios');
const fs = require('fs');
// http://192.168.23.10:3000 开发环境
// http://intelligenttest.cpsol.net 阿里云测试环境
/**
 * 解析.env.local文件，获取服务器地址
 * @returns {*}
 */
function getServiceIp() {
  const data = fs.readFileSync('./.env.local').toString("utf-8");
  let result = {};
  for (let item of data.split('\r\n')) {
    if (item.indexOf('=') >= 0) {
      const _splitArr = item.split('=');
      result[_splitArr[0]] = _splitArr[1];
    }
  }
  return result.serviceIp;
}

const serviceIp = getServiceIp() || 'http://intelligenttest.cpsol.net';
console.log("服务器地址：" + serviceIp);
axios({
  method: 'get',
  url: serviceIp + '/djcps_web/models/console/index.html',
}).then(res => {
  console.log('下载模板成功');
  fs.writeFileSync('public/index.html', res.data, 'utf8');
}).catch((e) => {
  console.log('下载模板失败,请重新下载模板 ---- ', e);
  process.exit(1);
});
