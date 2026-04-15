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
  const plots = memories.filter(m => m.type === 'plot');

  if (characters.length > 0) {
    sections.push('【相关人物记忆】');
    characters.forEach((char, idx) => {
      sections.push(`${idx + 1}. ${char.metadata.name}: ${char.metadata.description}`);
      if (char.metadata.currentStatus) {
        sections.push(`   当前状态: ${char.metadata.currentStatus}`);
      }
    });
  }

  if (plots.length > 0) {
    sections.push('\n【相关情节记忆】');
    plots.forEach((plot, idx) => {
      sections.push(`${idx + 1}. 章节${plot.metadata.chapterNumber}: ${plot.metadata.summary}`);
      if (plot.metadata.foreshadowing) {
        sections.push(`   伏笔: ${plot.metadata.foreshadowing}`);
      }
    });
  }

  return sections.join('\n');
}
