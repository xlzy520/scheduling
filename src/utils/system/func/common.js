import {orderKeys} from '../constant/dataKeys';
import _enum  from '../enum';
import dayjs  from 'dayjs';
export const cloneData = function (arr = [], obj1 = {}, obj2 = {}) {
  arr.forEach(key=>{
    obj1[key] = obj2[key];
  });
  return obj1;
};

export const getMaterialSize = function (obj, bool) {
  let length = obj[orderKeys.materialLength] || '';
  let width = obj[orderKeys.materialWidth] || '';
  if (bool) {
    return [length, width];
  } else {
    return length || width ? `${length}*${width}` : '';
  }
};

export const getProductSize = function (obj) {
  let length = obj[orderKeys.productLength] || '';
  let width = obj[orderKeys.productWidth] || '';
  let height = obj[orderKeys.productHeight] || '';
  return length || width || height ? `${length}*${width}*${height}` : '';
};

export const getOrderTip = function (obj, bool) {
  let orderTip = _enum.orderTip._swap[obj[orderKeys.orderTip]] || {};
  return (bool ? orderTip.omit : orderTip.label) || '';
};

export const handleTime = function (obj, keys, bool) {
  function time(t) {
    if (t) {
      return dayjs(t).format(bool ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')
    }
    return '';
  }
  if (Array.isArray(keys)) {
    keys.forEach(key=>{
      obj[key] = time(obj[key]);
    })
  } else {
    obj[keys] = time(obj[keys]);
  }
};
export function getOriginKey(key) {
  return 'original' + key.substring(0,1).toUpperCase() + key.substring(1);
}
