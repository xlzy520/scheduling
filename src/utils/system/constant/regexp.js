const regexp = {
  //固定电话
  PHONE_REGEXP: /^(\d{3}-\d{8,11}|\d{4}-\d{7,10})$/,
  //移动电话/手机
  MOBILE_REGEXP: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
  //短号
  SHORTPHONE_REGEXP: /^\d{6}$/,
  //身份证
  IDCARD_REGEXP: /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/,
  //邮箱
  EMAIL_REGEXP: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
  //库位容积
  VOLUME_REGEXP: /^\d{0,6}(\.|(\.\d{0,3}))?$/,
  //库位承重
  WEIGHT_REGEXP: /^\d{0,5}(\.|(\.\d{0,2}))?$/,
  //库位长宽高
  LENGTH_REGEXP: /^\d{0,2}(\.|(\.\d))?$/,
  //正整数
  NONZERO_REGEXP: /^(\d*[1-9]+\d*)?$/,
  //数字+字母
  NUMBER_LETTER_REGEXP: /^[0-9a-zA-Z]*$/,
  //整数+小数
  FIGURE_REGEXP: /^((\d*[1-9]+\d*(\.\d*)?)|0+\.(\d*}[1-9]+\d*))?$/,
  //中文+字母+数字
  NORMAL_TEXT_REGEXP: /^[\u4e00-\u9fa5a-zA-Z0-9]*$/,
  //获得特定最大浮点位数正则
  getFloatReg(num, bool) {
    if (bool) {
      let arr = [];
      for (let i = 0; i < num; i++) {
        arr.push(`(0+\\.(${i === 0 ? '' : `\\d{0,${i}}`}[1-9]${num - i - 1 === 0 ? '' : `\\d{0,${num - i - 1}}`}))`);
      }
      return new RegExp(`^((\\d*[1-9]+\\d*(\\.\\d{0,${num}})?)|${arr.join('|')})?$`);
    } else {
      return new RegExp(`^(\\d+(\\.\\d{0,${num}})?)?$`);
    }
  }
};
export default regexp;
