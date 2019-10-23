import regexp from "../../utils/system/constant/regexp";
export default {
  chinese: {pattern: /^[\u4e00-\u9fa5]+$/, message: '请输入汉字', trigger: 'change'},
  word_number: {pattern: /^\w+$/, message: '请输入字母、数字', trigger: 'change'},
  float: {pattern: regexp.getFloatReg(2, true), message: '请输入最多两位小数，且不为0', trigger: 'change'}, //正整数或小数
  float3: {pattern: regexp.getFloatReg(3, true), message: '请输入最多三位小数，且不为0', trigger: 'change'}, //正整数或小数
  number: {pattern: /^\d*[1-9]+\d*$/, message: '请输入正整数', trigger: 'change'}, //正整数,不为0
  float2: {pattern: regexp.getFloatReg(2, true), message: '请输入两位小数', trigger: 'change'}, //只能输入两位小数
  number5: {pattern: /^[0]*?([1-9]\d{0,3})$/, message: '请输入范围1~9999的整数', trigger: 'change'}, //5代表整数部分不超过五位数
  float5: {pattern: /^[0]*?(([1-9]\d{0,3})(\.\d{1,2})?|(0\.\d{1,2}))$/, message: '请输入范围0~9999的小数', trigger: 'change'}, //包括小数
  word_number_chinese: {pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: '请输入数字、字母、汉字', trigger: 'change'},
};
