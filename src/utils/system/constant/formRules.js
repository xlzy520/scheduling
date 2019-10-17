import regexp from './regexp';
import methods from '../../methods';
const { judgeAllEmpty } = methods;
// import { formRules } from 'djcpsweb-utils';
import { formRules } from 'djcpsweb-utils';
export default {
  ...formRules,
  number: {pattern: regexp.NONZERO_REGEXP, message: '请输入正整数', trigger: 'change'}, //正整数
  chinese: {pattern: /^[\u4e00-\u9fa5]+$/, message: '请输入汉字', trigger: 'change'},
  word_number: {pattern: /^\w+$/, message: '请输入字母、数字', trigger: 'change'},
  float: {pattern: regexp.getFloatReg(2, true), message: '请输入最多两位小数，且不为0', trigger: 'change'}, //正整数或小数
  float3: {pattern: regexp.getFloatReg(3, true), message: '请输入最多三位小数，且不为0', trigger: 'change'}, //正整数或小数
  float2: {pattern: regexp.getFloatReg(2, true), message: '请输入两位小数', trigger: 'change'}, //只能输入两位小数
  number5: {pattern: /^[0]*?([1-9]\d{0,3})$/, message: '请输入范围1~9999的整数', trigger: 'change'}, //5代表整数部分不超过五位数
  float5: {pattern: /^[0]*?(([1-9]\d{0,3})(\.\d{1,2})?|(0\.\d{1,2}))$/, message: '请输入范围0~9999的小数', trigger: 'change'}, //包括小数
  word_number_chinese: {pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: '请输入数字、字母、汉字', trigger: 'change'},

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
  }, //下料规格校验
  orderAmount_range: {
    validator(rule, value, callback) {
      if (!value || (!regexp.NONZERO_REGEXP.test(value) || Number(value) > 100000 || Number(value) <= 0)) {
        callback(new Error('请输入范围1~99999的正整数'));
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
  // getVformulaToWidthRule(materialWidth) {
  //   return { validator: (rule, value, callback) => {
  //       if (value && value.length) {
  //         let sum = value.reduce((sum, cur) => {
  //           sum += Number(cur || 0);
  //           return sum;
  //         }, 0);
  //         if (sum !== Number(materialWidth) && sum !== 0) {
  //           callback(new Error('请输入正确的压线公式'));
  //         } else {
  //           callback();
  //         }
  //       } else {
  //         callback();
  //       }
  //     }
  //   };
  // },
  getEmptyRule(msg) {
    return {
      validator: (rule, value, callback) => {
        if (judgeAllEmpty(value)) {
          callback(new Error(msg));
        } else {
          callback();
        }
      }
    }
  }
};
