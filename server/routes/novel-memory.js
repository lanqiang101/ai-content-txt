import express from 'express';
import { NovelMemoryManager } from '../utils/memory-manager.js';

export default function (chromaClient) {
  const router = express.Router();

  // 初始化记忆管理器
  const memoryManager = new NovelMemoryManager(chromaClient);
  memoryManager.init().catch(err => console.error('[NovelMemory] Init failed:', err));

  /**
   * 检索相关记忆
   * POST /api/novel-memory/retrieve
   * body: { query: string, topK?: number }
   */
  router.post('/retrieve', async (req, res) => {
    try {
      const { query, topK = 5 } = req.body;
      const results = await memoryManager.retrieveRelated(query, topK);
      const formatted = memoryManager.formatMemoryForPrompt(results);
      res.json({
        success: true,
        results,
        formatted,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 添加人物
   * POST /api/novel-memory/character
   */
  router.post('/character', async (req, res) => {
    try {
      await memoryManager.addCharacter(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 更新人物
   * PUT /api/novel-memory/character/:id
   */
  router.put('/character/:id', async (req, res) => {
    try {
      await memoryManager.updateCharacter(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 添加伏笔
   * POST /api/novel-memory/foreshadowing
   */
  router.post('/foreshadowing', async (req, res) => {
    try {
      await memoryManager.addForeshadowing(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 标记伏笔已回收
   * PUT /api/novel-memory/foreshadowing/:id/resolve
   */
  router.put('/foreshadowing/:id/resolve', async (req, res) => {
    try {
      await memoryManager.resolveForeshadowing(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 添加章节
   * POST /api/novel-memory/chapter
   */
  router.post('/chapter', async (req, res) => {
    try {
      await memoryManager.addChapter(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 获取所有未回收伏笔
   * GET /api/novel-memory/foreshadowings/unresolved
   */
  router.get('/foreshadowings/unresolved', async (req, res) => {
    try {
      const result = await memoryManager.getUnresolvedForeshadowings();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 获取所有人物
   * GET /api/novel-memory/characters
   */
  router.get('/characters', async (req, res) => {
    try {
      const result = await memoryManager.getAllCharacters();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 清空所有记忆
   * DELETE /api/novel-memory
   */
  router.delete('/', async (req, res) => {
    try {
      await memoryManager.clear();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 获取记忆统计
   * GET /api/novel-memory/stats
   */
  router.get('/stats', async (req, res) => {
    try {
      const stats = await memoryManager.stats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
