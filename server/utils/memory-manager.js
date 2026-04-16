/**
 * 小说创作记忆管理模块
 * 基于向量检索的分层记忆架构，解决长上下文认知收缩问题
 * 支持人物关系、伏笔设定、情节线索的记忆存储与检索
 * 
 * 使用 Xenova/all-MiniLM-L6-v2 模型进行文本嵌入
 * 模型文件存储在项目的 models/embedding 目录中
 * 使用 SQLite 存储向量数据，无需外部服务
 */

import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

// 获取当前文件的目录路径（ESM模块）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置 transformers.js 强制离线模式
env.allowLocalModels = true;
env.useBrowserCache = false;

// 设置环境变量，禁止网络请求
process.env.TRANSFORMERS_OFFLINE = '1';
process.env.HF_HUB_OFFLINE = '1';

// 项目内模型路径（相对于 server/utils 目录）
const PROJECT_MODEL_PATH = path.join(__dirname, '..', '..', 'models', 'embedding');

export class NovelMemoryManager {
  constructor(db, collectionName = 'novel_memory') {
    this.db = db; // SQLite数据库实例
    this.collectionName = collectionName;
    this.extractor = null;
    this.isInitialized = false;
    this.useFallback = false; // 是否使用备用方案
  }

  /**
   * 简单的hash-based向量化（备用方案）
   * 将文本转换为384维向量（与all-MiniLM-L6-v2相同维度）
   * @param {string} text - 输入文本
   * @returns {Float32Array} - 384维向量
   */
  simpleEmbedding(text) {
    const vectorSize = 384;
    const vector = new Float32Array(vectorSize);
    
    // 使用SHA-256生成hash
    const hash = crypto.createHash('sha256').update(text).digest();
    
    // 将hash扩展到384维
    for (let i = 0; i < vectorSize; i++) {
      const byteIndex = i % 32; // SHA-256是32字节
      vector[i] = (hash[byteIndex] / 255.0) * 2 - 1; // 归一化到[-1, 1]
    }
    
    // 添加一些基于文本特征的变异
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i < Math.min(words.length, 100); i++) {
      const wordHash = crypto.createHash('md5').update(words[i]).digest();
      const index = wordHash[0] % vectorSize;
      vector[index] += (wordHash[1] / 255.0) * 0.1;
    }
    
    // 归一化向量
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vectorSize; i++) {
        vector[i] /= norm;
      }
    }
    
    return vector;
  }

  /**
   * 初始化记忆管理系统
   * 尝试加载嵌入模型，失败则使用备用方案
   */
  async init() {
    try {
      console.log('[MemoryManager] Checking model directory...');
      console.log(`[MemoryManager] Model path: ${PROJECT_MODEL_PATH}`);
      
      // 检查模型目录是否存在
      if (!fs.existsSync(PROJECT_MODEL_PATH)) {
        throw new Error(`Model directory not found: ${PROJECT_MODEL_PATH}\nPlease ensure the model files are in the project's models/embedding directory.`);
      }
      
      // 验证关键文件是否存在
      const requiredFiles = ['config.json', 'tokenizer.json', 'vocab.txt'];
      const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(PROJECT_MODEL_PATH, file)));
      
      if (missingFiles.length > 0) {
        throw new Error(`Missing model files: ${missingFiles.join(', ')}`);
      }
      
      console.log('[MemoryManager] ✅ Model files verified, loading Xenova/all-MiniLM-L6-v2...');
      
      // 从项目内路径加载模型
      this.extractor = await pipeline('feature-extraction', PROJECT_MODEL_PATH, {
        quantized: false, // 使用完整精度模型
      });
      
      this.useFallback = false;
      console.log('[MemoryManager] ✅ Xenova model loaded successfully from project directory');
    } catch (error) {
      console.warn('[MemoryManager] ⚠️ Failed to load Xenova model:', error.message);
      console.warn('[MemoryManager] 🔄 Falling back to simple hash-based embedding');
      this.useFallback = true;
      this.extractor = null;
    }
    
    try {
      // 创建记忆数据表（如果不存在）
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS ${this.collectionName} (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          metadata TEXT,
          vector BLOB,
          created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
          updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
        )
      `);
      
      // 创建索引以加速查询
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_memory_type ON ${this.collectionName}(type)
      `);
      
      this.isInitialized = true;
      console.log('[MemoryManager] ✅ Memory system initialized successfully');
      console.log(`[MemoryManager] Embedding mode: ${this.useFallback ? 'Simple Hash (Fallback)' : 'Xenova/all-MiniLM-L6-v2 (Project Model)'}`);
      return true;
    } catch (error) {
      console.error('[MemoryManager] ❌ Database initialization failed:', error.message);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * 将文本转换为向量
   * @param {string} text - 输入文本
   * @returns {Promise<Float32Array>} - 向量表示
   */
  async embedText(text) {
    if (this.useFallback || !this.extractor) {
      // 使用备用方案
      return this.simpleEmbedding(text);
    }

    // 使用Xenova模型
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return output.data; // Float32Array
  }

  /**
   * 计算两个向量之间的余弦相似度
   * @param {Float32Array} vec1 
   * @param {Float32Array} vec2 
   * @returns {number} - 相似度分数 (0-1)
   */
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (norm1 * norm2);
  }

  /**
   * 添加人物记忆
   * @param {Object} params
   * @param {string} params.id - 人物ID
   * @param {string} params.name - 人物姓名
   * @param {string} params.description - 人物描述（性格、外貌等）
   * @param {string} params.currentStatus - 当前状态
   * @param {string[]} params.events - 已发生事件列表
   * @param {string} params.content - 用于检索的文本内容
   */
  async addCharacter({ id, name, description, currentStatus, events = [], content }) {
    if (!this.isInitialized) {
      console.warn('[MemoryManager] Not initialized, skipping addCharacter');
      return;
    }

    const fullContent = `
人物: ${name}
描述: ${description}
当前状态: ${currentStatus}
已发生事件: ${events.join(', ')}
${content}
    `.trim();

    // 生成向量
    const vector = await this.embedText(fullContent);
    
    // 存储到数据库
    const now = Date.now();
    const metadata = JSON.stringify({
      type: 'character',
      characterId: id,
      name,
      description,
      currentStatus,
      events,
    });

    this.db.prepare(`
      INSERT OR REPLACE INTO ${this.collectionName} 
      (id, type, content, metadata, vector, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `char_${id}`,
      'character',
      fullContent,
      metadata,
      Buffer.from(vector.buffer),
      now,
      now
    );

    console.log(`[MemoryManager] Added character memory: ${name}`);
  }

  /**
   * 更新人物记忆
   * @param {string} id - 人物ID
   * @param {Object} updateFields - 需要更新的字段 (description, currentStatus, events, content 等)
   */
  async updateCharacter(id, updateFields) {
    if (!this.isInitialized) {
      console.warn('[MemoryManager] Not initialized, skipping updateCharacter');
      return;
    }

    const stmt = this.db.prepare(`SELECT * FROM ${this.collectionName} WHERE id = ?`);
    const existing = stmt.get(`char_${id}`);

    if (!existing) {
      throw new Error(`Character ${id} not found`);
    }

    const existingMetadata = JSON.parse(existing.metadata);
    
    // 合并元数据
    const newMetadata = { ...existingMetadata, ...updateFields };
    
    // 重新构建内容以生成新向量
    // 注意：这里假设 updateFields 中包含了构建 fullContent 所需的最新数据
    // 如果只更新了部分字段，可能需要从 existingMetadata 中获取旧值补充
    const name = updateFields.name || existingMetadata.name;
    const description = updateFields.description || existingMetadata.description;
    const currentStatus = updateFields.currentStatus || existingMetadata.currentStatus;
    const events = updateFields.events || existingMetadata.events || [];
    const content = updateFields.content || ''; // 如果没有新content，可能需要保留旧的或者从别处获取

    const fullContent = `
人物: ${name}
描述: ${description}
当前状态: ${currentStatus}
已发生事件: ${events.join(', ')}
${content}
    `.trim();

    const vector = await this.embedText(fullContent);
    const now = Date.now();

    this.db.prepare(`
      UPDATE ${this.collectionName} 
      SET content = ?, metadata = ?, vector = ?, updated_at = ?
      WHERE id = ?
    `).run(
      fullContent,
      JSON.stringify(newMetadata),
      Buffer.from(vector.buffer),
      now,
      `char_${id}`
    );

    console.log(`[MemoryManager] Updated character memory: ${name}`);
  }

  /**
   * 添加伏笔记忆
   */
  async addForeshadowing({ id, title, content, chapter, relatedCharacters = [], plantedAt }) {
    if (!this.isInitialized) {
      console.warn('[MemoryManager] Not initialized, skipping addForeshadowing');
      return;
    }

    const docContent = `伏笔: ${title}\n${content}\n关联人物: ${relatedCharacters.join(', ')}\n埋设章节: ${chapter}`;
    const vector = await this.embedText(docContent);
    
    const now = Date.now();
    const metadata = JSON.stringify({
      type: 'foreshadowing',
      foreshadowingId: id,
      title,
      chapter,
      plantedAt: plantedAt || now,
      resolved: false,
      relatedCharacters,
    });

    this.db.prepare(`
      INSERT OR REPLACE INTO ${this.collectionName} 
      (id, type, content, metadata, vector, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `fwd_${id}`,
      'foreshadowing',
      docContent,
      metadata,
      Buffer.from(vector.buffer),
      now,
      now
    );

    console.log(`[MemoryManager] Added foreshadowing memory: ${title}`);
  }

  /**
   * 标记伏笔已回收
   */
  async resolveForeshadowing(id) {
    if (!this.isInitialized) {
      console.warn('[MemoryManager] Not initialized, skipping resolveForeshadowing');
      return;
    }

    const stmt = this.db.prepare(`SELECT * FROM ${this.collectionName} WHERE id = ?`);
    const existing = stmt.get(`fwd_${id}`);

    if (!existing) {
      throw new Error(`Foreshadowing ${id} not found`);
    }

    const metadata = JSON.parse(existing.metadata);
    metadata.resolved = true;
    metadata.resolvedAt = Date.now();

    this.db.prepare(`
      UPDATE ${this.collectionName} 
      SET metadata = ?, updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(metadata),
      Date.now(),
      `fwd_${id}`
    );

    console.log(`[MemoryManager] Resolved foreshadowing: ${id}`);
  }

  /**
   * 添加章节记忆
   */
  async addChapter(chapterId, title, content, summary) {
    if (!this.isInitialized) {
      console.warn('[MemoryManager] Not initialized, skipping addChapter');
      return;
    }

    const docContent = `章节: ${title}\n${summary}\n${content}`;
    const vector = await this.embedText(docContent);
    
    const now = Date.now();
    const metadata = JSON.stringify({
      type: 'chapter',
      chapterId,
      title,
      summary,
    });

    this.db.prepare(`
      INSERT OR REPLACE INTO ${this.collectionName} 
      (id, type, content, metadata, vector, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `chp_${chapterId}`,
      'chapter',
      docContent,
      metadata,
      Buffer.from(vector.buffer),
      now,
      now
    );

    console.log(`[MemoryManager] Added chapter memory: ${title}`);
  }

  /**
   * 根据当前prompt检索相关记忆（带优先级权重）
   * @param {string} query - 当前生成prompt
   * @param {number} topK - 返回结果数量
   * @param {string} filterType - 可选的类型过滤 (character/foreshadowing/chapter/plot)
   * @returns {Promise<Array<{id: string, type: string, content: string, metadata: Object, similarity: number, weightedScore: number}>>}
   */
  async retrieveRelated(query, topK = 5, filterType = null) {
    if (!this.isInitialized) {
      console.warn('[MemoryManager] Not initialized, returning empty results');
      return [];
    }

    console.log('[MemoryManager] Retrieving with query:', query.substring(0, 100), filterType ? `(filter: ${filterType})` : '');
    
    try {
      // 生成查询向量
      const queryVector = await this.embedText(query);

      // 根据filterType构建SQL查询
      let sql = `SELECT * FROM ${this.collectionName}`;
      if (filterType) {
        sql += ` WHERE type = ?`;
      }
      
      const memories = filterType 
        ? this.db.prepare(sql).all(filterType)
        : this.db.prepare(sql).all();
      
      if (memories.length === 0) {
        return [];
      }

      // 🔥 记忆类型优先级权重
      const typeWeights = {
        character: 1.5,      // 人物设定最重要
        foreshadowing: 1.3,  // 伏笔次之
        chapter: 1.0,        // 章节内容基础权重
        plot: 1.2,           // 情节线索
      };

      // 计算相似度并应用权重
      const scored = memories.map(memory => {
        // SQLite BLOB 转回 Float32Array
        const vectorBuffer = memory.vector;
        const vector = new Float32Array(vectorBuffer.buffer, vectorBuffer.byteOffset, vectorBuffer.byteLength / 4);
        
        const baseSimilarity = this.cosineSimilarity(queryVector, vector);
        const typeWeight = typeWeights[memory.type] || 1.0;
        const weightedScore = baseSimilarity * typeWeight;
        
        return {
          id: memory.id,
          type: memory.type,
          content: memory.content,
          metadata: JSON.parse(memory.metadata),
          similarity: baseSimilarity,
          weightedScore,
        };
      });

      // 按加权分数降序排序，返回topK
      const results = scored
        .sort((a, b) => b.weightedScore - a.weightedScore)
        .slice(0, topK);

      console.log(`[MemoryManager] Retrieved ${results.length} relevant memories (weighted)`);
      return results;

    } catch (error) {
      console.error('[MemoryManager] Query failed:', error);
      return [];
    }
  }

  /**
   * 格式化检索结果为prompt注入文本
   * @param {Array} retrievedResults - retrieveRelated 返回的结果
   * @returns {string}
   */
  formatMemoryForPrompt(retrievedResults) {
    if (!retrievedResults || retrievedResults.length === 0) {
      return '';
    }

    const sections = {
      character: '### 相关人物设定\n',
      foreshadowing: '### 相关伏笔\n',
      chapter: '### 之前相关章节\n',
    };

    const grouped = {};
    retrievedResults.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(`- ${item.content.trim()}`);
    });

    let output = '';
    Object.keys(grouped).forEach(type => {
      if (sections[type]) {
        output += sections[type] + grouped[type].join('\n\n') + '\n\n';
      }
    });

    return output.trim();
  }

  /**
   * 获取所有未回收的伏笔
   */
  async getUnresolvedForeshadowings() {
    if (!this.isInitialized) {
      return [];
    }

    const stmt = this.db.prepare(`SELECT * FROM ${this.collectionName} WHERE type = 'foreshadowing'`);
    const memories = stmt.all();
    
    return memories
      .map(m => ({
        ...m,
        metadata: JSON.parse(m.metadata),
      }))
      .filter(m => !m.metadata.resolved);
  }

  /**
   * 🔥 记忆压缩：合并相似的人物记忆
   * @param {number} similarityThreshold - 相似度阈值（默认0.85）
   */
  async compressSimilarMemories(similarityThreshold = 0.85) {
    if (!this.isInitialized) {
      console.warn('[MemoryManager] Not initialized, skipping compression');
      return;
    }

    console.log('[MemoryManager] Starting memory compression...');
    
    // 获取所有人物记忆
    const characters = this.db.prepare(`SELECT * FROM ${this.collectionName} WHERE type = 'character'`).all();
    
    let mergedCount = 0;
    
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        const char1 = characters[i];
        const char2 = characters[j];
        
        // 计算相似度
        const vec1 = new Float32Array(char1.vector.buffer, char1.vector.byteOffset, char1.vector.byteLength / 4);
        const vec2 = new Float32Array(char2.vector.buffer, char2.vector.byteOffset, char2.vector.byteLength / 4);
        const similarity = this.cosineSimilarity(vec1, vec2);
        
        if (similarity > similarityThreshold) {
          console.log(`[MemoryManager] Merging similar characters: ${char1.metadata.name} & ${char2.metadata.name} (similarity: ${similarity.toFixed(2)})`);
          
          // 合并元数据
          const meta1 = JSON.parse(char1.metadata);
          const meta2 = JSON.parse(char2.metadata);
          
          const mergedMetadata = {
            ...meta1,
            events: [...(meta1.events || []), ...(meta2.events || [])],
            mergedFrom: [meta1.characterId, meta2.characterId],
            mergedAt: Date.now(),
          };
          
          // 更新第一个记录，删除第二个
          this.db.prepare(`UPDATE ${this.collectionName} SET metadata = ?, updated_at = ? WHERE id = ?`).run(
            JSON.stringify(mergedMetadata),
            Date.now(),
            char1.id
          );
          
          this.db.prepare(`DELETE FROM ${this.collectionName} WHERE id = ?`).run(char2.id);
          mergedCount++;
        }
      }
    }
    
    console.log(`[MemoryManager] Compression complete: merged ${mergedCount} memories`);
    return mergedCount;
  }

  /**
   * 获取记忆统计信息
   */
  getStats() {
    if (!this.isInitialized) {
      return {
        initialized: false,
        totalMemories: 0,
        byType: {},
      };
    }

    const totalStmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.collectionName}`);
    const typeStmt = this.db.prepare(`SELECT type, COUNT(*) as count FROM ${this.collectionName} GROUP BY type`);
    
    const total = totalStmt.get();
    const byTypeRows = typeStmt.all();
    
    const byType = {};
    byTypeRows.forEach(row => {
      byType[row.type] = row.count;
    });
    
    return {
      initialized: true,
      totalMemories: total.count,
      byType,
    };
  }

  /**
   * 获取记忆统计（异步方法，保持兼容）
   */
  async stats() {
    return this.getStats();
  }

  /**
   * 清空所有记忆
   */
  async clear() {
    if (!this.isInitialized) return;
    
    this.db.exec(`DELETE FROM ${this.collectionName}`);
    console.log('[MemoryManager] Memory cleared');
  }
}

export default NovelMemoryManager;
