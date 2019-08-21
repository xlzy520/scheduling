import { Message } from 'element-ui';
// import { messageConfig } from '@/elementUI/elementConfig';
var config = {
  baseURL: location.origin, //url根路径
  onResponse(res) { //后端返回数据时执行（不管success时true还是false）
    return res;
  },
  // onError(msg) { //请求没有连接上后端时执行
  //   Message({message: msg, type: 'error', showClose: true});
  // },
  onFailure(data) { //请求没有连接上后端和success为false时执行
    // Message(Object.assign({}, messageConfig, {message: msg, type: 'error'}));
    Message(Object.assign({}, {message: data.msg, type: 'error'}));
  }
};

export default config;
