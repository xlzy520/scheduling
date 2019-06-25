// import {getCookiesItem} from './storage';
// import {Notification} from 'element-ui';
import {coerceBoolean} from '@/utils/common/func/boolean';
import {SubjectFactory} from './listen-trigger';

const webSocket = function(option) {
  /**
   * websocket实例
   * @type {websock}
   */
  let websock;
  /**
   * socket名称
   * @type {socketName}
   */
  let socketName;
  /**
   * 订阅实例
   * @type {subject}
   */
  let subject = new SubjectFactory();
  /**
   * 创建时间
   * @type {createTime}
   */
  let createTime = new Date().getTime();
  /**
   * 增加事件监听
   * @param eventName 事件名
   * @param fn 方法
   */
  const on = (eventName, fn) => {
    subject.listen(eventName, fn);
  };
  /**
   * 移除监听事件
   * @param eventName 事件名
   * @param fn 方法
   */
  const removeListeners = (eventName, fn) => {
    subject.remove(eventName, fn);
  };
  /**
   * 移除监听事件
   * @param eventName 事件名
   */
  const removeAllListeners = (eventName) => {
    subject.remove(eventName);
  };
  const getList = () => {
    return subject.getSubjectList();
  };
  // send = (eventName) => {
  //   subject.trigger(eventName);
  // };
  const threadPoxi = (sendData)=>{ // 实际调用的方法
    //若是ws开启状态
    if (websock.readyState === websock.OPEN) {
      send(sendData);
    } else if (websock.readyState === websock.CONNECTING) { // 若是 正在开启状态，则等待300毫秒
      setTimeout(function () {
        threadPoxi(sendData);
      }, 300);
    } else { // 若未开启 ，则等待500毫秒
      // 检测到断开后自动重连功能
      // initWebSocket();
      // setTimeout(function () {
      //   threadPoxi(sendData);
      // }.bind(this), 500);
      console.log("connection has closed");
    }
  };
  /**
   * 初始化websocket
   * @param option 配置
   */
  const initWebSocket = (option) => { //初始化websocket
    if (coerceBoolean(option) && coerceBoolean(option.wsurl) && coerceBoolean(option.name)) {
      websock = new WebSocket(option.wsurl);
      socketName = option.name;
      websock.onopen = onOpen;
      websock.onmessage = onMessage;
      websock.onclose = onClose;
      websock.onerror = onError;
    }
  };
  const onMessage = (e) => {
    responseBeat(e);
    subject.trigger('onmessage', e);
  };
  // 关闭webSocket
  const resetWebSocket = () => {
    if (!websock) {
      return;
    }
    websock.close(1000, "账户退出关闭ws");
    websock = undefined;
  };
  const onOpen = (e) => {
    console.log("--- ws开启 ---", e);
    // sendNotification({type: '2', msg: socketName + '-WebSocket已开启'});
    // ws.close(1000,"测试");
  };
  const responseBeat = (e) => { // 回应心跳
    const dataSource = JSON.parse(e.data);
    // console.log(dataSource);
    dataSource.type === "1" && threadPoxi(e.data);
  };
  const send = (agentData) => {//数据发送
    // location.reload();
    // console.log('response');
    // console.log(websock);
    websock.send(agentData);
  };
  const onClose = (e) =>{ //关闭
    console.log("connection closed (" + e.code + ")");
    // sendNotification({type: '2', msg: socketName + '-WebSocket已关闭'});
  };
  const onError = (e) => {
    console.error("--- ws错误 ---" + e);
  };
  // const sendNotification = (dataSource) => {
  //   Notification({
  //     title: dataSource.type === '1' ? '心跳测试(后续会移除)' : '消息',
  //     message: dataSource.msg,
  //     type: dataSource.type === '1' ? 'info' : 'success',
  //     //success, warning, info, error
  //     position: 'bottom-right'
  //   });
  // };
  //初始化WebSocket
  initWebSocket(option);
  return {
    websock,
    socketName,
    createTime,
    on,
    removeAllListeners,
    removeListeners,
    send,
    getList,
    resetWebSocket
  };
};

export default webSocket;
