import { Message } from 'element-ui';
// import { messageConfig } from '@/elementUI/elementConfig';
var config = {
  baseURL: location.origin, //url根路径
  onResponse(res) { //后端返回数据时执行（不管success时true还是false）
    return res;
  },
  onError(data) { //请求没有连接上后端时执行
    Message(Object.assign({}, {message: data.msg, type: 'error'}));
  },
  onFailure(data) { //请求没有连接上后端和success为false时执行
    // Message(Object.assign({}, messageConfig, {message: msg, type: 'error'}));
    Message(Object.assign({}, {message: data.msg, type: 'error'}));
    if (data.code === '10001302') {
      if (data.data) {
        setTimeout(() => {
          window.location.href = data.data.loginUrl;
        }, 1000);
      }
    }
  }
};

export default config;
