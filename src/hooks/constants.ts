// 循环配置 - 针对长文本优化的黄金比例
export const CYCLE_CONFIG = {
  stage1: { cycles: 2, name: '核心骨架搭建期' },
  stage2: { cycles: 8, name: '血肉细节填充期' }, // 🔥 从3增加到8，降低每轮字数压力
  stage3: { cycles: 2, name: '去AI化质感打磨期' },
  total: 12,
};