import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = (db) => {
  const routes = express.Router();

  /**
   * 获取作品的所有章节
   * GET /api/chapters?workId=xxx
   */
  routes.get('/chapters', (req, res) => {
    try {
      const { workId } = req.query;
      
      if (!workId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required query parameter: workId' 
        });
      }
      
      const stmt = db.prepare('SELECT * FROM chapters WHERE work_id = ? AND deleted_at IS NULL ORDER BY chapter_number ASC');
      const chapters = stmt.all(workId);
      
      res.json({ success: true, chapters });
    } catch (error) {
      console.error('[API] Get chapters error:', error);
      res.status(500).json({ success: false, error: 'Failed to get chapters' });
    }
  });

  /**
   * 获取单章详情
   * GET /api/chapters/detail?workId=xxx&chapterNumber=1
   */
  routes.get('/chapters/detail', (req, res) => {
    try {
      const { workId, chapterNumber } = req.query;
      
      if (!workId || !chapterNumber) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required query parameters: workId and chapterNumber' 
        });
      }
      
      const chapterNum = parseInt(chapterNumber);
      
      if (isNaN(chapterNum)) {
        return res.status(400).json({ success: false, error: 'Invalid chapter number' });
      }
      
      const stmt = db.prepare('SELECT * FROM chapters WHERE work_id = ? AND chapter_number = ? AND deleted_at IS NULL');
      const chapter = stmt.get(workId, chapterNum);
      
      if (!chapter) {
        return res.status(404).json({ success: false, error: 'Chapter not found' });
      }
      
      res.json({ success: true, chapter });
    } catch (error) {
      console.error('[API] Get chapter error:', error);
      res.status(500).json({ success: false, error: 'Failed to get chapter' });
    }
  });

  /**
   * 创建或更新章节（Upsert）
   * POST /api/chapters
   * Body: { workId, chapter_number, title, content, word_count, status, summary }
   */
  routes.post('/chapters', (req, res) => {
    try {
      const { workId, chapter_number, title, content, word_count, status, summary } = req.body;
      
      // 🔥 参数验证
      if (!workId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required field: workId' 
        });
      }
      
      if (!chapter_number || !content) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: chapter_number and content' 
        });
      }
      
      console.log(`[API] Saving chapter: workId=${workId}, chapter=${chapter_number}, length=${content.length}`);
      
      // 🔥 由后端生成UUID，不再使用前端生成的ID
      const id = uuidv4();
      const now = Date.now();
      
      // 使用 UPSERT 逻辑（基于 work_id + chapter_number 的唯一约束）
      const stmt = db.prepare(`
        INSERT INTO chapters (id, work_id, chapter_number, title, content, word_count, status, summary, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
        ON CONFLICT(work_id, chapter_number) DO UPDATE SET
          id = excluded.id,
          title = excluded.title,
          content = excluded.content,
          word_count = excluded.word_count,
          status = excluded.status,
          summary = excluded.summary,
          updated_at = excluded.updated_at
      `);
      
      stmt.run(
        id,
        workId,
        chapter_number,
        title || `第${chapter_number}章`,
        content,
        word_count || content.length,
        status || 'draft',
        summary || '',
        now,
        now
      );
      
      console.log(`[API] ✅ Chapter saved successfully: ${id}`);
      
      // 返回更新后的章节（包含后端生成的ID）
      const selectStmt = db.prepare('SELECT * FROM chapters WHERE id = ?');
      const chapter = selectStmt.get(id);
      
      res.json({ success: true, chapter });
    } catch (error) {
      console.error('[API] Save chapter error:', error);
      console.error('[API] Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      res.status(500).json({ 
        success: false, 
        error: 'Failed to save chapter',
        details: error.message 
      });
    }
  });

  /**
   * 删除章节（软删除）
   * DELETE /api/chapters
   * Body: { workId, chapterNumber }
   */
  routes.delete('/chapters', (req, res) => {
    try {
      const { workId, chapterNumber } = req.body;
      
      if (!workId || !chapterNumber) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: workId and chapterNumber' 
        });
      }
      
      const id = `chapter_${workId}_${chapterNumber}`;
      const now = Date.now();
      
      // 软删除：设置 deleted_at
      const stmt = db.prepare('UPDATE chapters SET deleted_at = ? WHERE id = ?');
      const result = stmt.run(now, id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Chapter not found' });
      }
      
      console.log(`[API] ✅ Chapter deleted: ${id}`);
      
      res.json({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
      console.error('[API] Delete chapter error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete chapter',
        details: error.message 
      });
    }
  });

  return routes;
};

export default router;
