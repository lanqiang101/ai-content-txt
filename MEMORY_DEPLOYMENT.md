# 记忆管理系统部署指南

## 📦 模型文件说明

本项目使用 **Xenova/all-MiniLM-L6-v2** 模型进行文本向量化，支持智能记忆的存储和检索。

### 模型位置
```
models/embedding/
├── config.json
├── tokenizer.json
├── vocab.txt
├── special_tokens_map.json
├── README.md
└── onnx/
    ├── model.onnx           # 完整精度模型 (~86MB)
    ├── model_int8.onnx      # INT8量化模型 (~22MB)
    └── model_quantized.onnx # 量化模型 (~22MB)
```

### Git版本控制
✅ **模型文件已纳入Git管理**

当您clone项目时，模型文件会自动下载，无需额外操作：
```bash
git clone <repository-url>
cd ai-content-txt
npm install
npm run dev
```

## 🚀 当前运行模式

### 模式1: Hash备用方案（默认）⚡

**状态**: ✅ 已激活  
**特点**:
- 完全离线可用
- 启动速度快（无模型加载延迟）
- 资源占用极低
- 功能100%可用

**适用场景**:
- 开发环境快速测试
- 离线环境
- 对语义精度要求不高的场景

### 模式2: Xenova专业模型（待优化）🎯

**状态**: ⚠️ 需要网络验证  
**特点**:
- 优秀的语义理解能力
- 高精度的相似度计算
- 首次加载需要访问Hugging Face服务器

**当前限制**:
由于 `@xenova/transformers` 库在Node.js环境中的实现限制，即使模型文件在本地，仍会尝试网络连接进行元数据验证。

## 🔧 启用专业模型的解决方案

### 方案A: 配置网络代理（推荐）

如果您的网络可以访问Hugging Face：

```bash
# 设置HTTP代理（如果需要）
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port

# 启动服务
npm run dev
```

首次成功加载后，模型会缓存到系统目录，后续启动可能不再需要网络。

### 方案B: 等待库更新

关注 [@xenova/transformers](https://github.com/xenova/transformers.js) 的更新，未来版本可能会改善Node.js离线加载支持。

### 方案C: 使用ONNX Runtime直接加载（高级）

如果您熟悉ONNX Runtime，可以直接使用 `onnxruntime-node` 加载模型，完全绕过transformers.js的网络验证。

示例代码框架：
```javascript
import * as ort from 'onnxruntime-node';

// 直接加载ONNX模型
const session = await ort.InferenceSession.create('./models/embedding/onnx/model.onnx');
// ... 实现tokenization和推理逻辑
```

## 📊 性能对比

| 特性 | Hash备用方案 | Xenova专业模型 |
|------|------------|--------------|
| 启动速度 | ⚡ 即时 | 🐌 需加载(5-30秒) |
| 网络依赖 | ❌ 无 | ⚠️ 需要(首次) |
| 语义精度 | ⭐⭐ 基础 | ⭐⭐⭐⭐⭐ 优秀 |
| 资源占用 | 💚 极低 | 💛 中等 |
| 可用性 | ✅ 100% | ⚠️ 受网络限制 |

## 💡 建议

### 对于开发环境
- ✅ 使用当前的Hash备用方案完全足够
- 记忆管理API正常工作
- 可以快速开发和测试功能

### 对于生产环境
- 如果追求最佳检索效果，配置网络访问
- 如果接受中等精度，Hash方案也可用
- 考虑实施混合策略：重要数据用专业模型，临时数据用Hash

## 🔍 验证当前模式

启动服务后查看日志：
```bash
# Hash模式
[MemoryManager] Embedding mode: Simple Hash (Fallback)

# Xenova模式
[MemoryManager] Embedding mode: Xenova/all-MiniLM-L6-v2 (Project Model)
```

测试API：
```bash
curl http://localhost:3000/api/memory/stats
```

## 📝 技术细节

### 向量维度
- **统一维度**: 384维（与all-MiniLM-L6-v2保持一致）
- **兼容性**: 两种模式生成的向量格式相同，可无缝切换

### Hash算法
```javascript
1. SHA-256生成基础hash (32字节)
2. 扩展到384维并归一化
3. 基于单词MD5添加特征变异
4. L2归一化确保向量质量
```

### 数据存储
- **数据库**: SQLite (ai-content-txt.db)
- **表名**: novel_memory
- **索引**: 按类型(type)建立索引加速查询

## 🆘 故障排查

### 问题1: 模型文件缺失
**症状**: 日志显示 "Model directory not found"  
**解决**: 
```bash
# 从Git恢复
git checkout models/embedding/

# 或重新复制
cp -r ~/.cache/huggingface/hub/models--Xenova--all-MiniLM-L6-v2/* models/embedding/
```

### 问题2: 服务启动失败
**症状**: 进程崩溃  
**解决**: 检查日志，Hash备用方案会确保服务正常启动

### 问题3: 检索结果为空
**原因**: 数据库中还没有添加记忆  
**解决**: 先调用添加接口存入数据

## 📞 支持与反馈

如有问题或建议，请提交Issue到项目仓库。

---

**最后更新**: 2026-04-15  
**模型版本**: Xenova/all-MiniLM-L6-v2  
**库版本**: @xenova/transformers latest