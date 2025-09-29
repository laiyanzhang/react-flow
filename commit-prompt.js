#!/usr/bin/env node

import { execSync } from 'child_process';
import readline from 'readline';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用 createRequire 来导入 CommonJS 模块
const require = createRequire(import.meta.url);

// 从 commitlint.config.cjs 中读取提交类型配置
const commitlintConfig = require('./commitlint.config.cjs');
const typeEnum = commitlintConfig.rules['type-enum'][2];

// 定义提交类型选项
const commitTypes = [
  { value: 'feat', name: 'feat:     新功能' },
  { value: 'fix', name: 'fix:      修复缺陷' },
  { value: 'style', name: 'style:    样式修复（不影响代码运行的变动）' },
  {
    value: 'refactor',
    name: 'refactor: 代码重构（不是新增功能，也不是修改bug的代码变动）',
  },
  { value: 'chore', name: 'chore:    构建或工具变更' },
  { value: 'perf', name: 'perf:     性能优化' },
].filter(type => typeEnum.includes(type.value)); // 确保只包含 commitlint 配置中的类型

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 实现简单的交互式选择
function selectCommitType() {
  let currentIndex = 0; // 默认选中第一项

  // 清屏并显示选项
  function renderOptions() {
    console.clear();

    commitTypes.forEach((type, index) => {
      if (index === currentIndex) {
        console.log(`> ${type.name} <`); // 高亮显示当前选中项
      } else {
        console.log(`  ${type.name}`);
      }
    });
  }

  // 初始渲染
  renderOptions();

  // 监听键盘事件
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise(resolve => {
    process.stdin.on('data', key => {
      const keyCode = key.toString();

      if (keyCode === '\u001B\u005B\u0041') {
        // 上箭头
        currentIndex =
          currentIndex > 0 ? currentIndex - 1 : commitTypes.length - 1;
        renderOptions();
      } else if (keyCode === '\u001B\u005B\u0042') {
        // 下箭头
        currentIndex =
          currentIndex < commitTypes.length - 1 ? currentIndex + 1 : 0;
        renderOptions();
      } else if (keyCode === '\r') {
        // 回车
        process.stdin.setRawMode(false);
        process.stdin.pause();
        console.clear();
        resolve(commitTypes[currentIndex].value);
      } else if (keyCode === '\u0003') {
        // Ctrl+C
        process.exit(0);
      }
    });
  });
}

// 获取提交描述
function getCommitDescription() {
  return new Promise(resolve => {
    rl.question('请输入提交描述 (必填): ', description => {
      if (!description.trim()) {
        console.error('\n❌ 错误: 提交描述不能为空，请重新输入');
        return getCommitDescription().then(resolve);
      }
      
      // 确保描述至少有5个字符
      if (description.trim().length < 5) {
        console.error('\n❌ 错误: 提交描述太短，请提供至少5个字符的有意义描述');
        return getCommitDescription().then(resolve);
      }
      
      resolve(description);
    });
  });
}

// 询问是否推送到远程仓库
function askForPush() {
  return new Promise(resolve => {
    rl.question('\n是否推送到远程仓库? (y/n): ', answer => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// 检查是否有可提交的更改
function checkChanges() {
  try {
    // 检查是否有暂存的更改
    const stagedChanges = execSync('git diff --cached --name-only').toString().trim();
    // 检查是否有未暂存的更改
    const unstagedChanges = execSync('git diff --name-only').toString().trim();
    
    if (!stagedChanges && !unstagedChanges) {
      console.log('\n❌ 没有检测到任何更改，无需提交');
      return false;
    }
    
    if (!stagedChanges && unstagedChanges) {
      console.log('\n⚠️ 检测到未暂存的更改，正在自动添加...');
      execSync('git add .', { stdio: 'inherit' });
      console.log('\n✅ 已添加所有更改到暂存区');
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ 检查更改失败:', error.message);
    return false;
  }
}

// 执行提交流程
async function promptCommit() {
  try {
    // 首先检查是否有可提交的更改
    if (!checkChanges()) {
      process.exit(0);
    }
    
    // 选择提交类型
    const type = await selectCommitType();

    // 获取提交描述
    const description = await getCommitDescription();

    // 组合提交信息
    const commitMessage = `${type}: ${description}`;

    // 设置环境变量，让commit-msg钩子知道这是通过脚本提交的
    process.env.HUSKY_SKIP_CZ = 'true';

    // 执行git commit命令
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log('\n✅ 提交成功!');
    
    // 询问是否推送到远程仓库
    const shouldPush = await askForPush();
    if (shouldPush) {
      console.log('\n正在推送到远程仓库...');
      execSync('git push', { stdio: 'inherit' });
      console.log('\n✅ 推送成功!');
    }
  } catch (error) {
    console.error('\n❌ 操作失败:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 执行提交流程
promptCommit();
