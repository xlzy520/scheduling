const hasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
};

function extend(to, _from) {
  for (let key in _from) {
    to[key] = _from[key];
  }
  return to;
};
//功能与Object.assign类似
export function toObject(arr) {
  var res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
};

export function isObject(obj) {
  return obj !== null && typeof obj === 'object';
};

export const getValueByPath = function(object, prop) {
  prop = prop || '';
  const paths = prop.split('.');
  let current = object;
  let result = null;
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if (!current) break;

    if (i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};

export const valueEquals = (a, b) => {
  // see: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
  if (a === b) return true;
  if (!(a instanceof Array)) return false;
  if (!(b instanceof Array)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i !== a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

/**
* 将对象中的null || undefined转化成 ''
* @param dataSource
*/
export function dealDataSource(dataSource) {
  for (let item of dataSource) {
    for (let key of Object.keys(item)) {
      // if (/(undefined|null)/g.test(item[key])) {
      if (item[key] === null) {
        item[key] = '';
      }
    }
  }
}

//深拷贝
export function deepClone (obj, ignoreKeyList = []) {
  for (let key in obj) {
    if (obj.constructor === Object && ignoreKeyList.includes(key)) {
      delete obj[key];
      continue;
    }
    obj[key] && (obj[key].constructor === Array || obj[key].constructor === Object) && deepClone(obj[key], ignoreKeyList);
  }
}

//生成obj标识
export function getObjKeyValue (obj, keyList) {
  var onlyKey = keyList;
  var str = '';
  if (!onlyKey) {
    return str;
  }
  if (Object.prototype.toString.call(keyList) === '[object String]') {
    onlyKey = [keyList];
  }
  onlyKey.forEach(key=>{
    str += `${key}:${obj[key]}--`;
  });
  return str;
}

//简单加密、解密
export function md (str, boolean, num = 1, handleErrorFn) {
  try {
    const key = 'dS5v1BdE';
    let rew = str;
    if (boolean) {
      let reg = new RegExp(`${key}$`);
      for (let i = 0;i < num; i++) {
        rew = window.atob(rew);
        rew = rew.replace(reg, '');
      }
    } else {
      for (let i = 0;i < num; i++) {
        rew += key;
        rew = window.btoa(rew);
      }
    }
    return rew;
  } catch (e) {
    handleErrorFn();
  }
}
