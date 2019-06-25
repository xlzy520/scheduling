const axios = require('axios');
const fs = require('fs');
const serviceIp = 'http://192.168.23.10:3000';

axios({
  method: 'get',
  url: serviceIp + '/assets/models/console/index.html',
}).then(res => {
  console.log('下载模板成功');
  fs.writeFileSync('public/index.html', res.data, 'utf8');
}).catch(() => {
  console.log('下载模板失败,请重新下载模板');
  process.exit(1);
});
