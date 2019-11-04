import regexp from './regexp';
// import { formRules } from 'djcpsweb-utils';
import { djForm } from 'djweb';
const { rules } = djForm;
export default {
  ...rules,
  number: {pattern: regexp.NONZERO_REGEXP, message: '请输入正整数', trigger: 'change'}, //正整数
  materialSize_not_empty: {
    validator(rule, value, callback) {
      if (!(value && value[0])) {
        callback(new Error('切长不能为空'));
      } else if (!value[1]) {
        callback(new Error('切宽不能为空'));
      } else {
        callback();
      }
    }
  },
  vformula_range: {
    validator(rule, value, callback) {
      if (value && !value.every(val => !val || (regexp.getFloatReg(2, true).test(val) && Number(val) < 10000))) {
        callback(new Error('请输入范围0.01~9999.99的两位小数'));
      } else {
        callback();
      }
    },
    // trigger: 'change'
  }, //纵压校验
  materialSize_range: {
    validator(rule, value, callback) {
      if (value && !value.every(val => !val || (regexp.getFloatReg(1, true).test(val) && Number(val) < 10000))) {
        callback(new Error('请输入范围0.1~9999.9的一位小数'));
      } else {
        callback();
      }
    },
    // trigger: 'change'
  }, //纵压校验
  orderAmount_range: {
    validator(rule, value, callback) {
      if (value && (!regexp.NONZERO_REGEXP.test(value) || Number(value) > 100000)) {
        callback(new Error('请输入范围0~99999的正整数'));
      } else {
        callback();
      }
    },
    trigger: 'change'
  }, //订单数量校验
  orderSort_range: {
    validator(rule, value, callback) {
      if (value && (!/^\d*$/.test(value) || Number(value) >= 10000 || Number(value) <= 0)) {
        callback(new Error('请输入范围1~9999的正整数'));
      } else {
        callback();
      }
    },
    trigger: 'change'
  }, //排序校验
  getVformulaToWidthRule(materialWidth) {
    return { validator: (rule, value, callback) => {
        if (value && value.length) {
          let sum = value.reduce((sum, cur) => {
            sum += Number(cur || 0);
            return sum;
          }, 0);
          if (sum !== Number(materialWidth) && sum !== 0) {
            callback(new Error('请输入正确的压线公式'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }
    };
  }
};
