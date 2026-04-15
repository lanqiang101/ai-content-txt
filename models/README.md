# 模型文件目录

本目录包含项目使用的AI模型文件，用于支持记忆管理功能的向量检索。

## 目录结构

```
models/
└── embedding/           # 文本嵌入模型
    └── Xenova/all-MiniLM-L6-v2
```

## 模型信息

- **模型名称**: Xenova/all-MiniLM-L6-v2
- **用途**: 将文本转换为384维向量，用于语义相似度计算
- **来源**: Hugging Face Hub (https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- **格式**: ONNX (优化后的神经网络模型格式)
- **大小**: ~86MB (完整精度版本)

## 使用方法

### 自动加载
服务器启动时会自动从 `models/embedding/` 目录加载模型，无需手动配置。

### 验证模型
启动服务后，查看控制台输出：
```
[MemoryManager] ✅ Model files verified, loading Xenova/all-MiniLM-L6-v2...
[MemoryManager] ✅ Xenova model loaded successfully from project directory
[MemoryManager] Embedding mode: Xenova/all-MiniLM-L6-v2 (Project Model)
```

### 备用方案
如果模型加载失败，系统会自动切换到基于Hash的简单向量化方案，确保功能可用。

## Git版本控制

✅ **此目录已添加到Git追踪**

当clone项目时，模型文件会随代码一起下载，无需额外步骤。

## 更新模型

如需更新模型版本：
1. 下载新版本模型文件
2. 替换 `models/embedding/` 目录下的所有文件
3. 提交更改到Git

## 注意事项

- 不要手动修改此目录下的文件
- 模型文件较大，首次clone可能需要较长时间
- 确保 `.gitignore` 未排除 `models/` 目录
