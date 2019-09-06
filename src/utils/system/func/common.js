import {orderKeys} from '../constant/dataKeys';
import _enum  from '../enum';
import {methods} from "djweb";
const { checkType } = methods;
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

export const getVFormula = function (obj = {}, key) {
  let val = obj[key];
  if (Array.isArray(val)) {
    return val.filter(val=>!['', null, undefined].includes(val)).map(val=>Number(val)).join('+');
  } else if (checkType(val, 'String')) {
    return val.split('+');
  }
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

/**
 * 移除以不限制0开头的0和以.0或.00结尾的数
 * @param formData  表单数据
 * @param props 字段名
 * @param contain 选择包含的字段，或者不包含的字段
 */
export function handleFormDataStartOrEndByZero(formData, props = [], contain = true) {
  const entriesFormData = Object.entries(formData);
  entriesFormData.map(v=>{
    if (props.includes(v[0]) === contain) {
      if (typeof v[1] === 'string') {
        v[1] = v[1].replace(/^[0]*|(\.[0]{1,2})$/g, '');
      }
    }
  });
  return fromEntries(entriesFormData);
}
function fromEntries (iterable) {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
}
