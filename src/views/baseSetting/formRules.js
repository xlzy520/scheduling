export default {
  chinese: {pattern: /[\u4e00-\u9fa5]/g, message: '请输入汉字', trigger: 'change'},
  word_number: {pattern: /^\w+$/g, message: '请输入字母、数字'},
  float: {pattern: /^(\d+(\.\d*)?)?$/g, message: '请输入数字', trigger: 'change'},
  number: {pattern: /^\d+$/g, message: '请输入整数', trigger: 'change'},
  number5: {pattern: /^\d{0,4}$/g, message: '请输入范围0~9999', trigger: 'change'}, //5代表整数部分不超过五位数
  float5: {pattern: /^(\d{0,4}(\.\d*)?)?$/g, message: '请输入范围0~9999', trigger: 'change'},
  word_number_chinese: {pattern: /[a-zA-Z0-9\u4e00-\u9fa5]/g, message: '请输入数字、字母、汉字'},
};
