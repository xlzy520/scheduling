import axios from 'axios';
import {Message} from 'element-ui';
// import {setCookiesItem} from 'djweb';
const {setCookiesItem} = require('djweb').methods;

const getExpireTime = () => {
  let times = 24 * 60 * 60 * 1000;
  let expireTimes = new Date(Date.now() + times);
  return expireTimes;
};

const online = [
  { key: 'url', value: 'http://192.168.23.6/djauth/new/weblogin.do' },
  // { key: 'username', value: '1000000' }, //王彦博专用
  // { key: 'username', value: '4000001' }, //王彦博专用
  // { key: 'username', value: '19999999999' }, //王彦博专用
  // { key: 'username', value: '15555555555' }, //王彦博专用
  // { key: 'username', value: '13666666666' }, //高级账户
  { key: 'username', value: '17826833470' },
  // { key: 'username', value: '17826833477' },
  { key: 'password', value: '339b522501ca880a03acbd86943b1129' },
  { key: 'appname', value: 'DJERP' }
];
const offline = [
  { key: 'url', value: 'http://192.168.10.200/djauth/new/weblogin.do' },
  { key: 'username', value: '11000000000' },
  { key: 'password', value: '339b522501ca880a03acbd86943b1129' },
  { key: 'appname', value: 'DJWMS' }
];
const online_dj = [
  { key: 'url', value: 'http://192.168.23.153/djauth/new/weblogin.do' },
  // { key: 'username', value: '5720001' },
  { key: 'username', value: '4000001' },
  { key: 'password', value: '339b522501ca880a03acbd86943b1129' },
  { key: 'appname', value: 'DJWMS' }
];

const par = function(state) {
  return {
    requestMethod: 'POST',
    requestUrl: state[0].value,
    requestHeaders: [],
    queryParams: JSON.stringify(state),
    respType: 'JSON'
  };
};

const autoLogin = () => {
  setCookiesItem('XXL_API_LOGIN_IDENTITY', '67616f7765695f3132333435365f30', {
    expires: getExpireTime(),
    path: '/'
  }, false);
  return axios({
    method: 'post',
    url: '/test/run',
    data: par(online),         //线下连接
    // data: par(offline),        //
    // data: par(online_dj),      //测试环境
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: function (data) {
      let str = [];
      for (let p in data) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
      }
      return str.join('&');
    }
  }).then(res => {
    let url = JSON.parse(res.data.content).data.url;
    let array = url.split('=');
    return array[array.length - 1];
  }).catch((err) => {
    Message.error(err.message);
    throw new Error(err);
  });
};

export default autoLogin;
