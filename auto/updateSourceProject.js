const nodeShell = require('./util/nodeShell');
const config = require('./util/config');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
let branch;
// process.stdin.setEncoding('utf8');
console.log('请输入要更新源项目分支:');
rl.on('line', (chunk) => {
  // let chunk = process.stdin.read();
  const input = chunk && chunk.replace(/\n$/, '');
  if (input !== undefined) {
    branch = chunk;
    update();
  } else {
    console.error('请输入正确的分支名！！！');
  }
});

function update() {
  console.log('正在更新。。。');
  shellExec('git remote -v', {}, (stdout)=>{
    if (/upstream/.test(stdout)) {
      shellExec('git remote remove upstream');
    }
  });
  shellExec(`git remote add upstream ${config.sourceProjectUrl}`);
  shellExec(`git fetch upstream ${branch}`);
  console.log('更新完成');
  process.exit(0);
}

function shellExec(str, option, fn) {
  nodeShell(str, Object.assign({}, config.shellOption, option), fn, ()=>{
    process.exit(0);
  });
}
