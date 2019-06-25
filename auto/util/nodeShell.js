const shell = require('shelljs');
const DEFAULT_OPTION = {
  silent: true,
  codeMsg: true,
  ignoreErr: false
};

function nodeShell(str, option, fn, errFn) {
  let resOption = Object.assign({}, DEFAULT_OPTION, option);
  let res = shell.exec(str, {silent: resOption.silent});
  let code = res.code;
  let stdout = res.stdout;
  resOption.codeMsg && console.log(str + ': ' + code);
  // console.warn(code);
  if (code && !resOption.ignoreErr) {
    // console.log('发布出错！！！！！');
    console.log(res.stderr);
    return errFn && errFn();
    // resetArr.length !==0 && reset();
    // process.exit(0);
  }
  return code === 0 && fn && fn(stdout);
}
module.exports = nodeShell;
