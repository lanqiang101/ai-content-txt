import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

export default function (db) {
  // 获取所有作品（分页）
  router.get('/works/list', (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const offset = (page - 1) * pageSize;

      const totalResult = db.prepare('SELECT COUNT(*) as count FROM works WHERE deleted_at IS NULL').get();
      const works = db.prepare(`
        SELECT * FROM works 
        WHERE deleted_at IS NULL 
        ORDER BY updated_at DESC 
        LIMIT ? OFFSET ?
      `).all(pageSize, offset);

      res.json({
        works: works.map(row => ({
          id: row.id,
          title: row.title,
          topic: row.topic,
          keywords: row.keywords,
          type: row.type,
          expectedWordCount: Number(row.expected_word_count),
          actualWordCount: Number(row.actual_word_count),
          chapterCount: Number(row.chapter_count),
          status: row.status,
          chapters: row.chapters ? JSON.parse(row.chapters) : [],
          characters: row.characters ? JSON.parse(row.characters) : [],
          createdAt: Number(row.created_at),
          updatedAt: Number(row.updated_at), // 🔥 字段映射：updated_at -> updatedAt
          storyboardIds: row.storyboard_ids ? JSON.parse(row.storyboard_ids) : undefined,
          content: row.content,
          generationParams: row.generation_params ? JSON.parse(row.generation_params) : undefined,
        })),
        total: Number(totalResult.count),
        page,
        pageSize,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 根据ID获取作品
  router.get('/works/:id', (req, res) => {
    try {
      const work = db.prepare('SELECT * FROM works WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
      if (!work) {
        return res.json(null);
      }
      res.json({
        id: work.id,
        title: work.title,
        topic: work.topic,
        keywords: work.keywords,
        type: work.type,
        expectedWordCount: Number(work.expected_word_count),
        actualWordCount: Number(work.actual_word_count),
        chapterCount: Number(work.chapter_count),
        status: work.status,
        chapters: work.chapters ? JSON.parse(work.chapters) : [],
        characters: work.characters ? JSON.parse(work.characters) : [],
        createdAt: Number(work.created_at),
        updatedAt: Number(work.updated_at), // 🔥 字段映射
        storyboardIds: work.storyboard_ids ? JSON.parse(work.storyboard_ids) : undefined,
        content: work.content,
        generationParams: work.generation_params ? JSON.parse(work.generation_params) : undefined,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 获取完整作品（包含章节）
  router.get('/works/:id/full', (req, res) => {
    try {
      const work = db.prepare('SELECT * FROM works WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
      if (!work) {
        return res.json(null);
      }
      const chapters = db.prepare('SELECT * FROM chapters WHERE work_id = ? AND deleted_at IS NULL ORDER BY chapter_number ASC').all(req.params.id);
      res.json({
        id: work.id,
        title: work.title,
        topic: work.topic,
        keywords: work.keywords,
        type: work.type,
        expectedWordCount: Number(work.expected_word_count),
        actualWordCount: Number(work.actual_word_count),
        chapterCount: Number(work.chapter_count),
        status: work.status,
        chapters: work.chapters ? JSON.parse(work.chapters) : [],
        characters: work.characters ? JSON.parse(work.characters) : [],
        createdAt: Number(work.created_at),
        updatedAt: Number(work.updated_at), // 🔥 字段映射
        storyboardIds: work.storyboard_ids ? JSON.parse(work.storyboard_ids) : undefined,
        content: work.content,
        generationParams: work.generation_params ? JSON.parse(work.generation_params) : undefined,
        chapters: chapters.map(row => ({
          id: row.id,
          workId: row.work_id,
          title: row.title,
          summary: row.summary,
          content: row.content,
          chapterNumber: row.chapter_number,
          wordCount: row.word_count,
          status: row.status,
          createdAt: Number(row.created_at),
          updatedAt: Number(row.updated_at),
        })),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 创建作品
  router.post('/works/add', (req, res) => {
    try {
      const work = req.body;
      const now = Date.now();
      
      // 🔥 如果前端没有传入ID，由后端生成UUID
      const workId = work.id || uuidv4();
      
      const stmt = db.prepare(`
        INSERT INTO works (
          id, title, topic, keywords, type, expected_word_count, actual_word_count,
          chapter_count, status, created_at, updated_at, storyboard_ids, content, generation_params
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        workId,  // 🔥 使用后端生成的ID或前端传入的ID
        work.title,
        work.topic,
        work.keywords,
        work.type,
        work.expectedWordCount,
        work.actualWordCount,
        work.chapterCount,
        work.status,
        work.createdAt || now,
        work.updatedAt || now,
        work.storyboardIds ? JSON.stringify(work.storyboardIds) : null,
        work.content,
        work.generationParams ? JSON.stringify(work.generationParams) : null
      );
      
      // 🔥 返回包含ID的完整作品信息
      res.json({
        ...work,
        id: workId,
      });
    } catch (error) {
      console.error('[Works] Add work error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 更新作品
  router.put('/works/:id', (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const existing = db.prepare('SELECT * FROM works WHERE id = ? AND deleted_at IS NULL').get(id);
      if (!existing) {
        return res.json(null);
      }

      const updatedAt = Date.now();
      const stmt = db.prepare(`
        UPDATE works SET
          title = COALESCE(?, title),
          topic = COALESCE(?, topic),
          keywords = COALESCE(?, keywords),
          expected_word_count = COALESCE(?, expected_word_count),
          actual_word_count = COALESCE(?, actual_word_count),
          chapter_count = COALESCE(?, chapter_count),
          status = COALESCE(?, status),
          created_at = COALESCE(?, created_at),
          updated_at = ?,
          storyboard_ids = COALESCE(?, storyboard_ids),
          content = COALESCE(?, content),
          generation_params = COALESCE(?, generation_params)
        WHERE id = ?
      `);
      stmt.run(
        updates.title,
        updates.topic,
        updates.keywords,
        updates.expectedWordCount,
        updates.actualWordCount,
        updates.chapterCount,
        updates.status,
        updates.createdAt,
        updatedAt,
        updates.storyboardIds ? JSON.stringify(updates.storyboardIds) : null,
        updates.content,
        updates.generationParams ? JSON.stringify(updates.generationParams) : null,
        id
      );

      const result = db.prepare('SELECT * FROM works WHERE id = ? AND deleted_at IS NULL').get(id);
      res.json({
        ...result,
        expectedWordCount: Number(result.expected_word_count),
        actualWordCount: Number(result.actual_word_count),
        storyboardIds: result.storyboard_ids ? JSON.parse(result.storyboard_ids) : undefined,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 删除作品
  router.delete('/works/:id', (req, res) => {
    try {
      const workId = req.params.id;
      
      // 🔥 先删除该作品的所有章节
      const chaptersResult = db.prepare('DELETE FROM chapters WHERE work_id = ?').run(workId);
      console.log(`[Delete Work] Deleted ${chaptersResult.changes} chapters for work ${workId}`);
      
      // 🔥 再删除该作品的所有人物设定
      const charactersResult = db.prepare('DELETE FROM characters WHERE work_id = ?').run(workId);
      console.log(`[Delete Work] Deleted ${charactersResult.changes} characters for work ${workId}`);
      
      // 🔥 最后删除作品本身（软删除）
      const result = db.prepare('UPDATE works SET deleted_at = ? WHERE id = ?').run(Date.now(), workId);
      
      console.log(`[Delete Work] ✅ Successfully deleted work ${workId}`);
      res.json({ 
        success: result.changes > 0,
        deletedChapters: chaptersResult.changes,
        deletedCharacters: charactersResult.changes,
      });
    } catch (error) {
      console.error('[Delete Work] Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 根据状态筛选作品
  router.get('/works/status/:status', (req, res) => {
    try {
      const status = req.params.status;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const offset = (page - 1) * pageSize;

      const countResult = db.prepare('SELECT COUNT(*) as count FROM works WHERE status = ? AND deleted_at IS NULL').get(status);
      const works = db.prepare(`
        SELECT * FROM works WHERE status = ? AND deleted_at IS NULL
        ORDER BY updated_at DESC LIMIT ? OFFSET ?
      `).all(status, pageSize, offset);

      res.json({
        works: works.map(row => ({
          ...row,
          expectedWordCount: Number(row.expected_word_count),
          actualWordCount: Number(row.actual_word_count),
          storyboardIds: row.storyboard_ids ? JSON.parse(row.storyboard_ids) : undefined,
        })),
        total: Number(countResult.count),
        page,
        pageSize,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 获取作品的章节列表
  router.get('/works/:id/chapters', (req, res) => {
    try {
      const chapters = db.prepare(`
        SELECT * FROM chapters WHERE work_id = ? AND deleted_at IS NULL
        ORDER BY chapter_number ASC
      `).all(req.params.id);
      res.json(chapters.map(row => ({
        ...row,
        workId: row.work_id,
        chapterNumber: row.chapter_number,
        wordCount: row.word_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 添加章节
  router.post('/works/:workId/chapters', (req, res) => {
    try {
      const { chapterNumber, title, summary, content, wordCount } = req.body;
      const now = Date.now();
      const id = `chapter_${now}_${Math.random().toString(36).substr(2, 9)}`;
      
      const stmt = db.prepare(`
        INSERT INTO chapters (id, work_id, chapter_number, title, summary, content, word_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, req.params.workId, chapterNumber, title || '', summary || '', content || '', wordCount || 0, now, now);
      
      res.json({
        id,
        workId: req.params.workId,
        chapterNumber,
        title,
        summary,
        content,
        wordCount,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 更新章节
  router.put('/chapters/:id', (req, res) => {
    try {
      const { title, summary, content, wordCount } = req.body;
      const now = Date.now();
      
      const stmt = db.prepare(`
        UPDATE chapters SET title = ?, summary = ?, content = ?, word_count = ?, updated_at = ?
        WHERE id = ? AND deleted_at IS NULL
      `);
      const result = stmt.run(title || '', summary || '', content || '', wordCount || 0, now, req.params.id);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: '章节不存在' });
      }
      
      const chapter = db.prepare('SELECT * FROM chapters WHERE id = ?').get(req.params.id);
      res.json({
        ...chapter,
        workId: chapter.work_id,
        chapterNumber: chapter.chapter_number,
        wordCount: chapter.word_count,
        createdAt: chapter.created_at,
        updatedAt: chapter.updated_at,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 删除章节
  router.delete('/chapters/:id', (req, res) => {
    try {
      const now = Date.now();
      const stmt = db.prepare('UPDATE chapters SET deleted_at = ? WHERE id = ?');
      const result = stmt.run(now, req.params.id);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: '章节不存在' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
