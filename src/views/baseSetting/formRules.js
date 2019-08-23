export default {
  chinese: {pattern: /[\u4e00-\u9fa5]/g, message: '请输入汉字', trigger: 'change'},
  word_number: {pattern: /^\w+$/g, message: '请输入字母、数字'},
  float: {pattern: /^(\d+(\.\d*)?)?$/g, message: '请输入数字', trigger: 'change'},
  number: {pattern: /^\d+$/g, message: '请输入整数', trigger: 'change'},
  float2: {pattern: /^(\d+(\.\d{0,2})?)?$/g, message: '请输入两位小数', trigger: 'change'},//只能输入两位小数
  number5: {pattern: /^[1-9]\d{0,3}$/g, message: '请输入范围1~9999的整数', trigger: 'change'}, //5代表整数部分不超过五位数
  float5: {pattern: /^(\d{0,4}(\.\d*)?)?$/g, message: '请输入范围0~9999的数', trigger: 'change'},
  word_number_chinese: {pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/g, message: '请输入数字、字母、汉字'},
};
