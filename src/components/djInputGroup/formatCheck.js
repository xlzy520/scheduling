/**
 * 判断对象中是否有特定属性
 * @param obj 判断对象
 * @param paths 属性路径
 * @returns {boolean}
 */
function getAttr(obj, paths) {
  let val = obj;
  paths.forEach(path=>{
    val = val[path];
  });
  return val;
}

/**
 * 判断对象中是否有特定属性
 * @param obj 判断对象
 * @param paths 属性路径
 * @returns {boolean}
 */
function hasAttr(obj, paths) {
  try {
    let val = obj;
    paths.forEach(path=>{
      val = val[path];
    });
    return val !== undefined && val !== null;
  } catch (e) {
    return false;
  }
}

function checkRequired(arr, paths) {
  for (let obj of arr) {
    if (!hasAttr(obj, paths)) {
      return false;
    }
  }
  return true;
}

/**
 * 判断某对象数组中每个对象的特定属性是否是唯一的
 * @param arr
 * @param paths
 */
function checkUnique(arr, paths) {
  let map = {};
  for (let obj of arr) {
    if (hasAttr(obj, paths)) {
      let val = getAttr(obj, paths);
      if (map[val]) {
        return false;
      } else {
        map[val] = true;
      }
    }
  }
  return true;
}

function configValidator(arr, name = 'config') {
  if (!checkUnique(arr, ['key'])) {
    console.warn(`${name}:'key'属性的值必须唯一`);
    return false;
  }
  return true;
}

function valueValidator(arr) {
  return checkRequired(arr, ['key']);
}

module.exports = {
  configValidator,
  valueValidator,
};
