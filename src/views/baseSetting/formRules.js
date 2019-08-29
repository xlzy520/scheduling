export default {
  chinese: {pattern: /^[\u4e00-\u9fa5]+$/g, message: '请输入汉字', trigger: 'change'},
  word_number: {pattern: /^\w+$/g, message: '请输入字母、数字'},
  float: {pattern: /^(([1-9]\d*)(\.\d{1,2})?|0\.[1-9]\d{0,1}|0\.0[1-9])$/g, message: '请输入最多两位小数，且不为0', trigger: 'change'}, //正整数或小数
  number: {pattern: /^(([1-9]\d*)|(0*\d+)|(0*\d+\.0*))$/g, message: '请输入正整数', trigger: 'change'}, //正整数
  float2: {pattern: /^(([1-9]\d*)(\.\d{1,2})?|0\.\d{1,2})$/g, message: '请输入两位小数', trigger: 'change'}, //只能输入两位小数
  number5: {pattern: /^([1-9]\d{0,3})|(0*[1-9]\d{0,3}|(0*\d+\.0*))$/g, message: '请输入范围1~9999的整数', trigger: 'change'}, //5代表整数部分不超过五位数
  float5: {pattern: /^(([1-9]\d{0,3})(\.\d{1,2})?|(0\.\d{1,2}))$/g, message: '请输入范围0~9999的数', trigger: 'change'},//包括小数
  word_number_chinese: {pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/g, message: '请输入数字、字母、汉字'},
};
