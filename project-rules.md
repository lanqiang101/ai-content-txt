# OpenClaw 开发错误记录
## 已修复问题 & 禁止复现

1. **空值访问错误**：`ReaderSection.tsx` 直接访问 `reader.ageRange`，reader 可能为 null → 已为所有7个参数 Section 添加默认值兜底，使用 `??` 空值合并
2. **Select.Item 空 value 错误**：`ConfigPage.tsx` 中 `SelectItem value=""` 违反 Radix UI 规范 → 已改为 `value="null"` 特殊值，代码中转换处理
3. **UI一致性问题 - 按钮位置**：Tab 切换布局中，同类操作按钮应放在相同位置。本项目左侧创作区域使用固定布局：
   - Tab头部固定
   - 配置内容可滚动
   - **主操作按钮永远放在底部边框区域（`border-t`下方，`flex-shrink-0`）固定，不随内容滚动
   - 单篇创作和批量创作的主按钮位置必须一致，样式必须统一
4. **UI一致性问题 - 按钮样式**：主提交/生成按钮使用统一样式：
   - 渐变背景：`bg-gradient-to-r from-purple-500 to-pink-500`
   - Hover：`hover:from-purple-600 hover:to-pink-600`
   - 阴影：`shadow-lg hover:shadow-xl transition-all`
   - 圆角：`rounded-xl`
   - 内边距：`px-4 py-4`
   - 字体：`text-lg font-semibold text-white`
   - 禁止使用纯色 `bg-primary` 做主按钮背景，保持视觉一致性
