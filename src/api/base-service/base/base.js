import { HttpFactory, methods } from 'djweb';
import httpConfig from '../http/httpConfig';
const apiService = new HttpFactory(httpConfig);
const { checkType, getObjectType, coerceBoolean } = methods;
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
    } else if (![null, ''].includes(param[i])) {
      handleParam[i] = param[i];
    }
  }
}

function baseApi(service, value = {}, method = 'post') {
  let { cancelToken } = value;
  delete value.cancelToken;
  let _value = value;
  if (checkType(value, ['Array', 'Object'])) {
    _value = Array.isArray(value) ? [] : {};
    loopParam(_value, value);
  }
  return apiService[method](service, _value, cancelToken);
}

export default function baseService(base) {
  return (url, param, method) => {
    let service = base + url;
    return baseApi(service, param, method);
  };
}
