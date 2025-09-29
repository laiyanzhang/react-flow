module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 添加新功能
        'fix', // bug修复
        'style', // 代码格式/样式调整
        'refactor', // 代码重构
        'chore', // 构建或工具变更
        'perf', // 性能优化
      ],
    ],
  },
};
