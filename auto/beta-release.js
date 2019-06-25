const nodeShell = require('./util/nodeShell');
const config = require('./util/config');
const {checkIsSourceProject, checkCommit, getRelative, getAllBranchHashAndMsg, getObjValue, checkNpmPublishUrl} = require('./util/common');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
// console.error('isDirectRelease', config.isDirectRelease);
// console.error('isNeedNpmPublish', config.isNeedNpmPublish);
let resetArr = [];
!config.test && beforeRelease();
let version;
let branchName;
let _branchName;
let relative = getRelative();
const localToRemote = relative.localToRemote;
const remoteToLocal = relative.remoteToLocal;
let allBranchLeastCommit = getAllBranchHashAndMsg();
console.log('请输入你要发布的本地分支:');
rl.on('line', (chunk) => {
  const input = chunk && chunk.replace(/\n$/, '');
  if (branchName === undefined) {
    _branchName = input;
    if (Object.keys(allBranchLeastCommit).includes(_branchName) && (config.isDirectRelease || _branchName !== 'master')) {
      branchName = _branchName;
      console.log('请输入版本号');
    } else {
      (config.isDirectRelease || _branchName !== 'master') && console.error('找不到该本地分支');
      (!config.isDirectRelease && _branchName === 'master') && console.error('不能选择master分支');
    }
  } else {
    if (/^(\d+.\d+.\d+)(-beta.\d+)?$/.test(input)) {
      version = input;
      console.log('开始发布版本v' + version);
      !config.isDirectRelease && releaseGit();
      config.isDirectRelease && directReleaseGit();
      publishNpm(version);
      console.log('版本发布成功');
      process.exit(0);
    } else {
      console.error('请输入正确的版本号！！！');
    }
  }

});

function releaseGit() {
  const remoteBranchName = localToRemote[branchName]; //无前缀:remotes/${origin}
  const localMasterBranchName = remoteToLocal['master']; //无前缀:remotes/${origin}
  let remoteMasterName = getObjValue(allBranchLeastCommit, 'remotes/\\S+/master')[0];
  let remoteBranchNameHaveBehand = getObjValue(allBranchLeastCommit, `remotes/\\S+/${remoteBranchName}`)[0];
  if (!localMasterBranchName || !remoteBranchName || !remoteMasterName || !remoteBranchNameHaveBehand) {
    console.error('找不到分支');
    process.exit(0);
  }
  // console.log('开始发布版本v' + version);
  // let allBranchLeastCommit = getRemoteBranchHashAndMsg();
  // let localDevName = getObjValue(allBranchLeastCommit, branchName)[0];
  shellExec(`git checkout ${localMasterBranchName}`, {}, () => {
    resetArr.push(`git checkout ${branchName}`);
  });
  shellExec(`git merge ${branchName}`, {}, () => {
    resetArr.push(`git push ${config.origin} ${localMasterBranchName}:master --force`);
    resetArr.push(`git reset --hard ${allBranchLeastCommit[remoteMasterName]}`);
  });
  shellExec('git add -A');
  shellExec(`git commit -m "[build] ${version}"`, {ignoreErr: true});
  shellExec(`npm version ${version} --message "[release] ${version}"`);
  shellExec(`git push ${config.origin} ${localMasterBranchName}:master`);
  shellExec(`git push ${config.origin} refs/tags/v${version}`, {}, () => {
    resetArr.push(`git push ${config.origin} :refs/tags/v${version}`);
    resetArr.push(`git tag -d v${version}`);
  });
  shellExec(`git checkout ${branchName}`, {}, () => {
    resetArr.push(`git checkout ${localMasterBranchName}`);
  });
  shellExec(`git rebase ${localMasterBranchName}`);
  shellExec(`git push ${config.origin} ${branchName}:${remoteBranchName}`, {}, ()=>{
    resetArr.push(`git reset --hard ${allBranchLeastCommit[branchName]}`);
    resetArr.push(`git push ${config.origin} ${branchName}:${remoteBranchName} --force`);
    resetArr.push(`git reset --hard ${allBranchLeastCommit[remoteBranchNameHaveBehand]}`);
  });
}

function directReleaseGit() {
  const remoteBranchName = localToRemote[branchName]; //无前缀:remotes/${origin}
  // const localMasterBranchName = remoteToLocal['master']; //无前缀:remotes/${origin}
  // let remoteMasterName = getObjValue(allBranchLeastCommit, 'remotes/\\S+/master')[0];
  let remoteBranchNameHaveBehand = getObjValue(allBranchLeastCommit, `remotes/\\S+/${remoteBranchName}`)[0];
  if (!remoteBranchName || !remoteBranchNameHaveBehand) {
    console.error('找不到分支');
    process.exit(0);
  }
  // console.log('开始发布版本v' + version);
  shellExec(`git checkout ${branchName}`);
  shellExec(`npm version ${version} --message "[release] ${version}"`, {}, ()=>{
    resetArr.push(`git reset --hard ${allBranchLeastCommit[branchName]}`);
    resetArr.push(`git push ${config.origin} ${branchName}:${remoteBranchName} --force`);
    resetArr.push(`git reset --hard ${allBranchLeastCommit[remoteBranchNameHaveBehand]}`);
  });
  shellExec(`git push ${config.origin} ${branchName}:${remoteBranchName}`);
  shellExec(`git push ${config.origin} refs/tags/v${version}`);
}

function publishNpm(v) {
  if (config.isNeedNpmPublish) {
    if (/^(\d+.\d+.\d+)$/.test(v)) {
      shellExec('npm publish');
    } else {
      shellExec('npm publish --tag beta');
    }
  }
}

function beforeRelease() {
  let flag;
  flag = checkIsSourceProject(config.sourceProjectUrl) && checkCommit() && !(config.isNeedNpmPublish && !checkNpmPublishUrl(config.npmPublishUrl));
  if (!flag) {
    process.exit(0);
  }
}

function shellExec(str, option, fn) {
  return nodeShell(str, Object.assign({}, config.shellOption, option), fn, ()=>{
    resetArr.length !== 0 && reset();
    process.exit(0);
  });
}

function reset() {
  console.log('正在回退，请勿退出。');
  // console.log(resetArr);
  resetArr.reverse().forEach(str => {
    shellExec(str, {ignoreErr: true});
  });
  console.log('回退完成');
}

