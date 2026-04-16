import express from 'express';

export default function (memoryManager) {
  const router = express.Router();

  /**
   * 检索相关记忆 (别名: search)
   * POST /api/memory/search
   * body: { query: string, topK?: number, filterType?: string }
   */
  router.post('/search', async (req, res) => {
    try {
      if (!memoryManager || !memoryManager.isInitialized) {
        return res.json({
          success: false,
          error: '记忆管理系统未初始化',
          results: [],
          formatted: '',
        });
      }

      const { query, topK = 5, filterType = null } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: '查询文本不能为空',
        });
      }

      const results = await memoryManager.retrieveRelated(query, topK, filterType);
      const formatted = formatMemoryForPrompt(results);
      
      res.json({
        success: true,
        results,
        formatted,
      });
    } catch (error) {
      console.error('[NovelMemory] Search failed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 检索相关记忆
   * POST /api/memory/retrieve
   * body: { query: string, topK?: number, filterType?: string }
   */
  router.post('/retrieve', async (req, res) => {
    try {
      if (!memoryManager || !memoryManager.isInitialized) {
        return res.json({
          success: false,
          error: '记忆管理系统未初始化',
          results: [],
          formatted: '',
        });
      }

      const { query, topK = 5, filterType = null } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: '查询文本不能为空',
        });
      }

      const results = await memoryManager.retrieveRelated(query, topK, filterType);
      const formatted = formatMemoryForPrompt(results);
      
      res.json({
        success: true,
        results,
        formatted,
      });
    } catch (error) {
      console.error('[NovelMemory] Retrieve failed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 添加章节记忆
   * POST /api/memory/chapter
   */
  router.post('/chapter', async (req, res) => {
    try {
      if (!memoryManager || !memoryManager.isInitialized) {
        return res.json({ success: false, error: '记忆管理系统未初始化' });
      }

      const { chapterId, title, content, summary } = req.body;
      
      if (!chapterId || !title || !content) {
        return res.status(400).json({ success: false, error: '缺少必要参数' });
      }

      await memoryManager.addChapter(chapterId, title, content, summary || '');
      res.json({ success: true });
    } catch (error) {
      console.error('[NovelMemory] Add chapter failed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 添加人物记忆
   * POST /api/memory/character
   */
  router.post('/character', async (req, res) => {
    try {
      if (!memoryManager || !memoryManager.isInitialized) {
        return res.json({ success: false, error: '记忆管理系统未初始化' });
      }

      const { id, name, description, currentStatus, events = [], content } = req.body;
      
      if (!id || !name || !description) {
        return res.status(400).json({ success: false, error: '缺少必要参数' });
      }

      await memoryManager.addCharacter({ id, name, description, currentStatus, events, content });
      res.json({ success: true });
    } catch (error) {
      console.error('[NovelMemory] Add character failed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 添加伏笔记忆
   * POST /api/memory/foreshadowing
   */
  router.post('/foreshadowing', async (req, res) => {
    try {
      if (!memoryManager || !memoryManager.isInitialized) {
        return res.json({ success: false, error: '记忆管理系统未初始化' });
      }

      const { id, title, content, chapter, relatedCharacters = [] } = req.body;
      
      if (!id || !title || !content) {
        return res.status(400).json({ success: false, error: '缺少必要参数' });
      }

      await memoryManager.addForeshadowing({ id, title, content, chapter, relatedCharacters });
      res.json({ success: true });
    } catch (error) {
      console.error('[NovelMemory] Add foreshadowing failed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 压缩相似记忆
   * POST /api/memory/compress
   */
  router.post('/compress', async (req, res) => {
    try {
      if (!memoryManager || !memoryManager.isInitialized) {
        return res.json({ success: false, error: '记忆管理系统未初始化' });
      }

      const { similarityThreshold = 0.85 } = req.body;
      const mergedCount = await memoryManager.compressSimilarMemories(similarityThreshold);
      
      res.json({ 
        success: true, 
        mergedCount,
        message: `成功合并 ${mergedCount} 条相似记忆`,
      });
    } catch (error) {
      console.error('[NovelMemory] Compression failed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 获取记忆统计信息
   * GET /api/memory/stats
   */
  router.get('/stats', (req, res) => {
    try {
      if (!memoryManager || !memoryManager.isInitialized) {
        return res.json({
          initialized: false,
          totalMemories: 0,
          byType: {},
        });
      }

      const stats = memoryManager.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

/**
 * 将记忆结果格式化为prompt文本
 * @param {Array} memories - 记忆列表
 * @returns {string} - 格式化后的文本
 */
function formatMemoryForPrompt(memories) {
  if (!memories || memories.length === 0) {
    return '';
  }

  const sections = [];

  // 按类型分组
  const characters = memories.filter(m => m.type === 'character');
  const foreshadowings = memories.filter(m => m.type === 'foreshadowing');
  const chapters = memories.filter(m => m.type === 'chapter');

  if (characters.length > 0) {
    sections.push('### 相关人物设定\n');
    characters.forEach((char, idx) => {
      sections.push(`${idx + 1}. **${char.metadata.name}**`);
      sections.push(`   - 描述: ${char.metadata.description}`);
      if (char.metadata.currentStatus) {
        sections.push(`   - 当前状态: ${char.metadata.currentStatus}`);
      }
      if (char.metadata.events && char.metadata.events.length > 0) {
        sections.push(`   - 已发生事件: ${char.metadata.events.join('、')}`);
      }
      sections.push('');
    });
  }

  if (foreshadowings.length > 0) {
    sections.push('### 相关伏笔\n');
    foreshadowings.forEach((fwd, idx) => {
      sections.push(`${idx + 1}. **${fwd.metadata.title}** (第${fwd.metadata.chapter}章)`);
      sections.push(`   - ${fwd.content}`);
      sections.push('');
    });
  }

  if (chapters.length > 0) {
    sections.push('### 之前相关章节\n');
    chapters.forEach((chp, idx) => {
      sections.push(`${idx + 1}. **${chp.metadata.title}**`);
      if (chp.metadata.summary) {
        sections.push(`   - 摘要: ${chp.metadata.summary}`);
      }
      sections.push('');
    });
  }

  return sections.join('\n');
}
