import {orderKeys} from '../constant/dataKeys';
import _enum from '../enum';
import {checkType, fileDownload} from "djcpsweb-utils";
import {isObject} from '../../common/func/object';

import dayjs from 'dayjs';
import {MessageBox, Message} from 'element-ui';

export const cloneData = function (arr = [], obj1 = {}, obj2 = {}) {
  arr.forEach(key => {
    obj1[key] = obj2[key];
  });
  return obj1;
};

export const getMaterialSize = function (obj = {}, bool, option = []) {
  let defaultOption = [orderKeys.materialLength, orderKeys.materialWidth];
  let lengthKey = option[0] || defaultOption[0];
  let widthKey = option[1] || defaultOption[1];
  let length = obj[lengthKey] || '';
  let width = obj[widthKey] || '';
  if (bool) {
    return [length, width];
  } else {
    return length || width ? `${length}*${width}` : '';
  }
};

export const getLayerFluteType = function (obj = {}, bool, option = []) {
  let defaultOption = [orderKeys.layer, orderKeys.fluteType];
  let layerKey = option[0] || defaultOption[0];
  let fluteTypeKey = option[1] || defaultOption[1];
  let layer = obj[layerKey] || '';
  let fluteType = obj[fluteTypeKey] || '';
  if (bool) {
    return [layer + '', fluteType + ''];
  } else {
    return `${layer}${fluteType}`;
  }
};

export const getProductSize = function (obj = {}) {
  let length = obj[orderKeys.productLength] || '';
  let width = obj[orderKeys.productWidth] || '';
  let height = obj[orderKeys.productHeight] || '';
  return length || width || height ? `${length}*${width}*${height}` : '';
};

export const getVFormula = function (obj = {}, key) {
  let val = obj[key];
  if (Array.isArray(val)) {
    return val.filter(val => !['', null, undefined].includes(val)).map(val => Number(val)).join('+');
  } else if (checkType(val, 'String')) {
    return val.split('+');
  }
};

export const getOrderTip = function (obj = {}, bool) {
  let orderTip = _enum.orderTip._swap[obj[orderKeys.orderTip]] || {};
  return (bool ? orderTip.omit : orderTip.label) || '';
};

export const getMergeStatus = function (obj = {}) {
  let orderTip = _enum.mergeStatus._swap[obj[orderKeys.mergeStatus]] || {};
  return orderTip.label || '';
};

export const handleTime = function (obj, keys, format = 'YYYY-MM-DD HH:mm:ss') {
  function time(t) {
    if (t) {
      return dayjs(t).format(format);
    }
    return '';
  }

  if (Array.isArray(keys)) {
    keys.forEach(key => {
      obj[key] = time(obj[key]);
    });
  } else {
    obj[keys] = time(obj[keys]);
  }
};

export function getOriginKey(key, suffix = 'original') {
  return suffix + key.substring(0, 1).toUpperCase() + key.substring(1);
}

export function getOrderList(arr) {
  return arr && arr.map(obj => obj[orderKeys.productionNo]);
}

/**
 * 移除以不限制0开头的0和以.0或.00结尾的数
 * @param formData  表单数据
 * @param props 字段名
 * @param contain 选择包含的字段，或者不包含的字段
 */
export function handleFormDataStartOrEndByZero(formData, props = [], contain = true) {
  const entriesFormData = Object.entries(formData);
  entriesFormData.map(v => {
    if (props.includes(v[0]) === contain) {
      if (typeof v[1] === 'string') {
        v[1] = v[1].replace(/^[0]*|(\.[0]{1,2})$/g, '');
      }
    }
  });
  return fromEntries(entriesFormData);
}

export function fromEntries(iterable) {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
}

//弹出提示框
export const tipBox = (txt, fn1) => {
  return new Promise(((resolve, reject) => {
    MessageBox.confirm(txt, '', {
      confirmButtonText: '确 认',
      cancelButtonText: '取 消',
      closeOnClickModal: false,
      closeOnPressEscape: false,
      closeOnHashChange: false,
      type: 'warning',
      showClose: false,
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          if (fn1 && fn1.constructor === Function) {
            instance.confirmButtonLoading = true;
            instance.cancelButtonLoading = true;
            instance.cancelButtonClass = 'is-disabled';
            let result = fn1();
            if (result && typeof result.then === 'function') {
              result.then(() => {
                done();
                resolve();
              }).catch(e => {
                done();
                reject(e);
              }).finally(() => {
                instance.confirmButtonLoading = false;
                instance.cancelButtonLoading = false;
                instance.cancelButtonClass = '';
              });
            } else {
              done();
              resolve();
              instance.confirmButtonLoading = false;
              instance.cancelButtonLoading = false;
            }
          } else {
            done();
            resolve();
          }
        } else {
          done();
          resolve();
        }
      }
    });
  }));
};

/**
 * 精度计算，避免精度丢失
 * @param {number} number_a 第一个计算值
 * @param {number} number_b 第二个计算值
 * @param {number} computedType 计算类型，+加-减*乘/除
 * @return {number} 计算结果
 */
/* eslint-disable */
export function accuracyCompute(number_a, number_b, computedType) {
  var result,
    decNum_a = getDecNum(number_a),
    decNum_b = getDecNum(number_b),
    decNum_sum = decNum_a + decNum_b,
    decNum_min = Math.min(decNum_a, decNum_b),
    decNum_max = Math.max(decNum_a, decNum_b);
  decNum_sum += decNum_max - decNum_min;
  decNum_sum = Math.pow(10, decNum_sum);
  decNum_max = Math.pow(10, decNum_max);
  number_a = changeToInt(number_a);
  number_b = changeToInt(number_b);
  if (decNum_a > decNum_b) {
    number_b *= Math.pow(10, decNum_a - decNum_b);
  } else {
    number_a *= Math.pow(10, decNum_b - decNum_a);
  }
  switch (computedType) {
    case '+':
      result = (number_a + number_b) / decNum_max;
      break;
    case '-':
      result = (number_a - number_b) / decNum_max;
      break;
    case '*':
      result = (number_a * number_b) / decNum_sum;
      break;
    case '/':
      result = number_a / number_b;
      break;
  }
  return result;

  /**
   * 获取数字的小数位数
   * @param {number} number 目标数字
   * @return {number} 目标数字的小数位数
   */
  function getDecNum(number) {
    var DecNum = 0;
    var stringNum = number.toString();
    if (stringNum.indexOf(".") !== -1) {
      DecNum = stringNum.split(".")[1].length;
    }
    return DecNum;
  }

  /**
   * 将数字转换成整数（去掉小数点）
   * @param {number} number 目标数字
   * @return {number} 目标数字的整数形式
   */
  function changeToInt(number) {
    if (number === '') {
      return '';
    } else {
      var string = number.toString().replace(".", "");
      // ie8下parseInt方法会对字符串'08'、'09'转换错误，需设置第二个参数为10
      return parseInt(string, 10);
    }
  }
};
/* eslint-disable */
//获取formData中可变的字段
export const getFormDataChangeableValue = (formData, config) => {
  return cloneData(config.reduce((arr, opt) => {
    function judgeChangeable(obj) {
      if (!(!obj.type || (obj.attrs && obj.attrs.disabled))) {
        arr.push(obj.formItem.prop);
      }
    }

    if (opt.formOptions) {
      opt.formOptions.forEach(obj => {
        judgeChangeable(obj);
      });
    } else {
      judgeChangeable(opt);
    }
    return arr;
  }, []), {}, formData);
};

//下载execl文件
export const downloadExecl = (data, text) => {
  return fileDownload(data, `${text} ${dayjs().format('YYYYMMDDHHmmss')}.xlsx`);
};

export const equalsObj = (oldData, newData) => {
  //       类型为基本类型时,如果相同,则返回true
  //eslint-disable-next-line
  if (oldData == newData || [oldData, newData].every(v=>['', null, undefined, NaN].includes(v))) return true;
  const isArray = Array.isArray;
  if (isObject(oldData) && isObject(newData) && Object.keys(oldData).length === Object.keys(newData).length) {
    //      类型为对象并且元素个数相同
    //      遍历所有对象中所有属性,判断元素是否相同
    for (const key in oldData) {
      if (oldData.hasOwnProperty(key)) {
        //      对象中具有不相同属性 返回false
        if (!equalsObj(oldData[key], newData[key])) {
          return false;
        }
      }
    }
  } else if (isArray(oldData) && isArray(newData) && oldData.length === newData.length) {
    //      类型为数组并且数组长度相同
    for (let i = 0, length = oldData.length; i < length; i++) {
      //      如果数组元素中具有不相同元素,返回false
      if (!equalsObj(oldData[i], newData[i])) {
        return false;
      }
    }
  } else {
    //      其它类型,均返回false
    return false;
  }
  //      走到这里,说明数组或者对象中所有元素都相同,返回true
  return true;
};

export const equalsObjMessage = (oldData, newData, needMsg = true)=>{
  const isEquals = equalsObj(oldData, newData);
  if (isEquals && needMsg) {
    Message.error({
      message: '未编辑数据，请确认',
      duration: 1000
    });
  }
  return isEquals;
};

export const parseTime = (time, format = 'YYYY-MM-DD') => {
  return time ? dayjs(time).format(format) : '';
};

export function getDateRange(type, startNum, startUnit = 'day', endNum = 0, endUnit = 'day') {
  let end = new Date(dayjs().add(endNum, endUnit).add(1, 'day').format('YYYY-MM-DD 00:00:00'));
  let start = new Date(dayjs(end).subtract(startNum, startUnit).subtract(endNum, endUnit).valueOf());
  if (type === 'daterange') {
    start = dayjs(start).format('YYYY-MM-DD 00:00:00');
    end = dayjs(end).subtract(1, 'day').format('YYYY-MM-DD 23:59:59');
  } else {
    start = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    end = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
  }
  return [start, end];
}

export function getLimitTime(val) {
  let _val = [...val];
  if (val[0] && val[1]) {
    let towMonth = dayjs(val[0]).add(91, 'day');
    if (towMonth.isBefore(dayjs(val[1]))) {
      this.$message('时间不能超过92天', 'error');
      _val = [val[0], towMonth.toDate()];
    }
    _val[0] = dayjs(_val[0]).format('YYYY-MM-DD 00:00:00');
    _val[1] = dayjs(_val[1]).format('YYYY-MM-DD 23:59:59');
  }
  return _val;
}

export function judgeEmpty(valArr) {
  return valArr.some(val=> ['', null, undefined].includes(val));
}

export function judgeAllEmpty(val) {
  return ['', undefined, null].includes(val) ||
    (Array.isArray(val) && val.every(v=>['', undefined, null].includes(v)) ||
      (checkType(val, 'Object') && Object.keys(val).every(key=>['', undefined, null].includes(val[key]))));
}
