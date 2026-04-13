import express from 'express';

const router = express.Router();

export default function (db) {
  // 获取生成历史（分页）
  router.get('/history', (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const offset = (page - 1) * pageSize;
      const countResult = db.prepare('SELECT COUNT(*) as count FROM content_history WHERE deleted_at IS NULL').get();
      const history = db.prepare(`SELECT * FROM content_history WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`).all();
      res.json({history, total: Number(countResult.count), page, pageSize});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 添加历史记录
  router.post('/history', (req, res) => {
    try {
      const item = req.body;
      const now = Date.now();
      const stmt = db.prepare(`INSERT INTO content_history (id, type, topic, result, created_at) VALUES (?, ?, ?, ?, ?)`);
      stmt.run(item.id, item.type, item.topic, item.result, item.createdAt || now);
      res.json(item);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 删除历史记录
  router.delete('/history/:id', (req, res) => {
    try {
      const result = db.prepare('UPDATE content_history SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
      res.json({success: result.changes > 0});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  return router;
}