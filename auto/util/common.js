const nodeShell = require('./nodeShell');
const {origin, shellOption} = require('./config');
// const shellOption = {
//   codeMsg: false
// };
exports.getAllBranchHashAndMsg = ()=> {
  return nodeShell(`git branch -a -v`, shellOption, (std) => {
    let branchArr = std.split('\n');
    let hashObj = {};
    branchArr.map(str=>{
      let name = /[\S]+/.exec(str.replace(/^[*| ] /, ''));
      let hash = /[0-9a-f]{7}/.exec(str);
      name && (hashObj[name] = hash);
      // console.log(name)
      // console.log(hash)
    });
    // console.log(hashObj);
    return hashObj;
  });
};

exports.getRelative = ()=> {
  return nodeShell(`git branch -vv`, shellOption, (std) => {
    let branchArr = std.split('\n');
    let localToRemote = {};
    let remoteToLocal = {};
    branchArr.map(str=>{
      if (str === '') {
        return;
      }
      let str_noCommit;
      let name = /[\S]+/.exec(str.replace(/^[*| ] /, ''));
      let hash = /[0-9a-f]{7}/.exec(str);
      nodeShell(`git show ${hash}`, shellOption, (std)=>{
        // console.log(std);
        let res = /\n\n[\s\S]+\n\n/.exec(std)[0].replace(/\n\n/g, '').replace(/^ +/, '');
        str_noCommit = str.replace(res, '');
      });
      // console.error(str_noCommit);
      let _remote = /\[\S+\/\S+(:[\s\S]+)?\]/.exec(str_noCommit);
      let remote = _remote && _remote[0].replace('[', '').replace(']', '').replace(/:[\s\S]+/, '').replace(/^\S+\//, '');
      // let remote = _remote && ('remotes/' + _remote[0].replace('[', '').replace(']', ''));
      // console.log(remote)
      localToRemote[name] = remote;
      remoteToLocal[remote] = name;
      // localToRemote[name] = _remote && _remote[0].replace('[', '').replace(']', '').replace(/^\S+\//, '');
      // remoteToLocal[_remote && _remote[0].replace('[', '').replace(']', '').replace(/^\S+\//, '')] = name;
      // console.log(name)
      // console.log(hash)
    });
    // console.log(hashObj);
    return {remoteToLocal, localToRemote};
  });
};

exports.getObjValue = (obj, reg) => {
  let regExp = new RegExp(reg);
  let arr = [];
  Object.keys(obj).forEach(str=>{
    regExp.test(str) && arr.push(str);
  });
  return arr;
};

exports.checkCommit = ()=>{
  return nodeShell('git status', shellOption, (std) => {
    if (std.indexOf('modified:') !== -1) {
      console.error('请先将本地修改的内容提交！！！');
      return false;
    } else {
      return true;
    }
  });
};

exports.checkPublishUrl = (publishUrl)=>{
  return nodeShell('npm config list', shellOption, (stdout)=>{
    let res = /http:\/\/\S+/i.exec(stdout);
    let url = res && res.constructor === Array && res[0].split('"')[0];
    if (url !== publishUrl) {
      console.error(`请配置npm地址为"${publishUrl}"再进行发布`);
      return false;
    } else {
      return true;
    }
  });
};

exports.checkIsSourceProject = (sourceUrl)=>{
  return nodeShell('git config --list', shellOption, (stdout)=>{
    let reg = new RegExp(`remote.${origin}.url=http:\\/\\/\\S+`, 'i');
    // console.log('origin', origin);
    let res = reg.exec(stdout);
    let url = res && res.constructor === Array && res[0].split('=')[1];
    if (url !== sourceUrl) {
      console.error('不能在fork的项目副本上发布版本，请在源项目发布');
      return false;
    } else {
      return true;
    }
  });
};
exports.checkNpmPublishUrl = (npmPublishUrl)=>{
  return nodeShell('npm config list', {}, (stdout)=>{
    let res = /http:\/\/\S+/i.exec(stdout);
    let url = res && res.constructor === Array && res[0].split('"')[0];
    if (url !== npmPublishUrl) {
      console.error(`请配置npm地址为"${npmPublishUrl}"再进行发布`);
      return false;
    } else {
      return true;
    }
  });
};

// module.expoers = {
//   getAllBranchHashAndMsg,
//   getObjValue,
//   getRelative
// };
