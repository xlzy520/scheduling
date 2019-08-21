// import { getObjectType } from '../utils/methods';
const { getObjectType } = require('djweb').methods;
const checkTypeConfig = {
  Function: ['onResponse', 'onFailure', 'onError'],
  String: ['baseURL'],
  Number: ['timeout']
};

function checkType(config, key, type) {
  let val = config[key];
  if (val && getObjectType(val) !== `[object ${type}]`) {
    console.warn(`HttpFactory config warning:${key}应为${type}类型`)
  }
}


export default (config) => {
  const _config = config || {};
  Object.keys(checkTypeConfig).forEach(type=>{
    checkTypeConfig[type].forEach(key=>{
      checkType(_config, key, type);
    })
  })
}
