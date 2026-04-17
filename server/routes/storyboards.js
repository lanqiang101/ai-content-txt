import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

export default function (db) {
  // 获取作品的所有分镜
  router.get('/storyboards/work/:workId', (req, res) => {
    try {
      const storyboards = db.prepare(`SELECT * FROM storyboards WHERE work_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`).all(req.params.workId);
      res.json(storyboards.map(row => ({...row, workId: row.work_id, config: JSON.parse(row.config), prompts: JSON.parse(row.prompts), totalDuration: Number(row.total_duration), createdAt: Number(row.created_at)})));
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 根据ID获取分镜
  router.get('/storyboards/:id', (req, res) => {
    try {
      const storyboard = db.prepare('SELECT * FROM storyboards WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
      if (!storyboard) return res.json(null);
      res.json({...storyboard, workId: storyboard.work_id, config: JSON.parse(storyboard.config), prompts: JSON.parse(storyboard.prompts), totalDuration: Number(storyboard.total_duration), createdAt: Number(storyboard.created_at)});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 创建分镜
  router.post('/storyboards', (req, res) => {
    try {
      const storyboard = req.body;
      const now = Date.now();
      
      // 🔥 由后端生成UUID
      const storyboardId = uuidv4();
      
      const stmt = db.prepare(`INSERT INTO storyboards (id, work_id, config, prompts, total_duration, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
      stmt.run(
        storyboardId,  // 🔥 使用后端生成的ID
        storyboard.workId, 
        JSON.stringify(storyboard.config), 
        JSON.stringify(storyboard.prompts), 
        storyboard.totalDuration, 
        storyboard.createdAt || now
      );
      
      // 🔥 返回包含后端生成ID的完整分镜数据
      res.json({
        ...storyboard,
        id: storyboardId,
      });
    } catch (error) {
      console.error('[Storyboards] Add storyboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 删除分镜
  router.delete('/storyboards/:id', (req, res) => {
    try {
      const result = db.prepare('UPDATE storyboards SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
      res.json({success: result.changes > 0});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  return router;
}