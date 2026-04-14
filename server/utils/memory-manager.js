/**
 * 小说创作记忆管理模块
 * 基于向量检索的分层记忆架构，解决长上下文认知收缩问题
 * 支持人物关系、伏笔设定、情节线索的记忆存储与检索
 */

import chroma from 'chromadb';

export class NovelMemoryManager {
  constructor(client, collectionName = 'novel_memory') {
    this.client = client || new chroma.ChromaClient();
    this.collectionName = collectionName;
    this.collection = null;
  }

  /**
   * 初始化记忆集合
   */
  async init() {
    try {
      this.collection = await this.client.getOrCreateCollection({ name: this.collectionName });
      console.log(`[MemoryManager] Initialized collection: ${this.collectionName}`);
      return true;
    } catch (error) {
      console.error('[MemoryManager] Init failed:', error);
      throw error;
    }
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
    const fullContent = `
人物: ${name}
描述: ${description}
当前状态: ${currentStatus}
已发生事件: ${events.join(', ')}
${content}
    `.trim();

    await this.collection.add({
      ids: [`char_${id}`],
      documents: [fullContent],
      metadatas: [{
        type: 'character',
        characterId: id,
        characterName: name,
        updatedAt: Date.now(),
      }],
    });

    console.log(`[MemoryManager] Added character: ${name} (${id})`);
  }

  /**
   * 更新人物记忆
   */
  async updateCharacter(id, updateFields) {
    // 先获取原有信息
    const existing = await this.collection.get({
      ids: [`char_${id}`],
    });

    if (!existing.ids || existing.ids.length === 0) {
      throw new Error(`Character ${id} not found`);
    }

    // 重新生成文档并更新
    const existingMetadata = existing.metadatas[0];
    const existingDoc = existing.documents[0];

    // merge 更新后重新存储
    await this.collection.delete({ ids: [`char_${id}`] });
    await this.collection.add({
      ids: [`char_${id}`],
      documents: [existingDoc],
      metadatas: [{ ...existingMetadata, ...updateFields, updatedAt: Date.now() }],
    });

    console.log(`[MemoryManager] Updated character: ${existingMetadata.characterName} (${id})`);
  }

  /**
   * 添加伏笔记忆
   */
  async addForeshadowing({ id, title, content, chapter, relatedCharacters = [], plantedAt }) {
    await this.collection.add({
      ids: [`fwd_${id}`],
      documents: [`伏笔: ${title}\n${content}\n关联人物: ${relatedCharacters.join(', ')}\n埋设章节: ${chapter}`],
      metadatas: [{
        type: 'foreshadowing',
        foreshadowingId: id,
        title,
        chapter,
        plantedAt: plantedAt || Date.now(),
        resolved: false,
        relatedCharacters,
      }],
    });

    console.log(`[MemoryManager] Added foreshadowing: ${title} (${id})`);
  }

  /**
   * 标记伏笔已回收
   */
  async resolveForeshadowing(id) {
    const existing = await this.collection.get({
      ids: [`fwd_${id}`],
    });

    if (!existing.ids || existing.ids.length === 0) {
      throw new Error(`Foreshadowing ${id} not found`);
    }

    await this.collection.update({
      ids: [`fwd_${id}`],
      metadatas: [{ ...existing.metadatas[0], resolved: true, resolvedAt: Date.now() }],
    });

    console.log(`[MemoryManager] Resolved foreshadowing: ${id}`);
  }

  /**
   * 添加章节记忆
   */
  async addChapter(chapterId, title, content, summary) {
    await this.collection.add({
      ids: [`chp_${chapterId}`],
      documents: [`章节: ${title}\n${summary}\n${content}`],
      metadatas: [{
        type: 'chapter',
        chapterId,
        title,
        summary,
        createdAt: Date.now(),
      }],
    });

    console.log(`[MemoryManager] Added chapter: ${title} (${chapterId})`);
  }

  /**
   * 根据当前prompt检索相关记忆
   * @param {string} query - 当前生成prompt
   * @param {number} topK - 返回结果数量
   * @returns {Promise<Array<{id: string, type: string, content: string, metadata: Object}>>}
   */
  async retrieveRelated(query, topK = 5) {
    const results = await this.collection.query({
      queryTexts: [query],
      nResults: topK,
    });

    return results.documents[0].map((doc, i) => ({
      id: results.ids[0][i],
      type: results.metadatas[0][i].type,
      content: doc,
      metadata: results.metadatas[0][i],
      distance: results.distances[0][i],
    }));
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
    const all = await this.collection.get();
    return all.metadatas.filter(m => m.type === 'foreshadowing' && !m.resolved);
  }

  /**
   * 获取所有人物列表
   */
  async getAllCharacters() {
    const all = await this.collection.get();
    return all.metadatas.filter(m => m.type === 'character');
  }

  /**
   * 清空所有记忆
   */
  async clear() {
    await this.collection.delete();
    this.collection = null;
    this.collection = await this.client.getOrCreateCollection({ name: this.collectionName });
    console.log('[MemoryManager] Memory cleared');
  }

  /**
   * 获取记忆统计
   */
  async stats() {
    const count = await this.collection.count();
    return {
      total: count,
      collectionName: this.collectionName,
    };
  }
}

export default NovelMemoryManager;
