import express from 'express';

const router = express.Router();

export default function (db) {
  // 获取作品的所有大纲
  router.get('/outlines/work/:workId', (req, res) => {
    try {
      const outlines = db.prepare(`SELECT * FROM book_outlines WHERE work_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`).all(req.params.workId);
      res.json(outlines.map(row => ({id: row.id, workId: row.work_id, chapters: JSON.parse(row.chapters), createdAt: Number(row.created_at)})));
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 根据ID获取大纲
  router.get('/outlines/:id', (req, res) => {
    try {
      const outline = db.prepare('SELECT * FROM book_outlines WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
      if (!outline) return res.json(null);
      res.json({id: outline.id, workId: outline.work_id, chapters: JSON.parse(outline.chapters), createdAt: Number(outline.created_at)});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 创建大纲
  router.post('/outlines', (req, res) => {
    try {
      const outline = req.body;
      const stmt = db.prepare(`INSERT INTO book_outlines (id, work_id, chapters, created_at) VALUES (?, ?, ?, ?)`);
      stmt.run(outline.id, outline.workId, JSON.stringify(outline.chapters), outline.createdAt);
      res.json(outline);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 更新大纲
  router.put('/outlines/:id', (req, res) => {
    try {
      const outline = req.body;
      const stmt = db.prepare(`UPDATE book_outlines SET chapters = ? WHERE id = ?`);
      stmt.run(JSON.stringify(outline.chapters), outline.id);
      res.json(outline);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 删除大纲
  router.delete('/outlines/:id', (req, res) => {
    try {
      const result = db.prepare('UPDATE book_outlines SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
      res.json({success: result.changes > 0});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  return router;
}