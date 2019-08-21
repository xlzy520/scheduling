import axios from 'axios';
// import { getObjectType, coerceBoolean } from '../utils/methods';
const { getObjectType, coerceBoolean } = require('djweb').methods;
/**
 * 循环传参对象，删除空字段
 * 移除值为‘’或 null 的数据
 * @param handleParam 新对象
 * @param param 原对象
 */
function loopParam(handleParam, param) {
  if (!coerceBoolean(param)) {
    return;
  }
  let keys = Object.keys(param);
  if (keys.length === 0) {
    return;
  }
  for (let i of keys) {
    if (getObjectType(param[i]) === '[object Object]') {
      handleParam[i] = {};
      loopParam(handleParam[i], param[i]);
    } else if (getObjectType(param[i]) === '[object Array]') {
      handleParam[i] = [];
      loopParam(handleParam[i], param[i]);
    } else if (!['', null].includes(param[i])) {
      handleParam[i] = param[i];
    }
  }
}

/**
 * 过滤空参数
 */
function filterEmptyValue(axiosApi) {
  axiosApi.interceptors.request.use(function (config) {
    // 在发送请求前，对参数或者请求头做处理
    // key值与请求类型有关 // todo 会不会有其他情况
    // 'get', 'delete', 'head' -- > 'params'
    // 'post', 'put', 'patch' -- > 'data'
    let key = ['get', 'delete', 'head'].includes(config.method) ? 'params' : 'data';

    const type = getObjectType(config[key]);
    if (['[object Array]', '[object Object]'].includes(type)) {
      let handleParam = type === '[object Array]' ? [] : {};
      loopParam(handleParam, config[key]);
      config[key] = handleParam;
    }
    return config;
  });
}

/**
 * create an axios instance
 * @param config
 * @returns {AxiosInstance}
 * @constructor
 */
function BasesApi(config) {
  // config = {
  // baseURL: '/djwmsservice' // api的base_url
  // timeout: 5000, // request timeout
  // cancelToken
  // }
  const axiosApi = axios.create(config);
  filterEmptyValue(axiosApi);
  return axiosApi;
}

export default BasesApi;
