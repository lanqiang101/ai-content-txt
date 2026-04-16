import express from 'express';

export default function(db) {
  const router = express.Router();

  // 获取所有热门主题（按分类）
  router.get('/popular-topics', (req, res) => {
    try {
      const topics = db.prepare(`
        SELECT id, category, topic, description, sort_order, enabled, created_at, updated_at
        FROM popular_topics
        WHERE enabled = 1
        ORDER BY category ASC, sort_order ASC
      `).all();
      
      // 按分类分组
      const grouped = {};
      topics.forEach(topic => {
        if (!grouped[topic.category]) {
          grouped[topic.category] = [];
        }
        grouped[topic.category].push({
          id: topic.id,
          topic: topic.topic,
          description: topic.description,
          sortOrder: topic.sort_order,
        });
      });
      
      res.json({ success: true, data: grouped });
    } catch (error) {
      console.error('获取热门主题失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 添加热门主题
  router.post('/popular-topics', (req, res) => {
    try {
      const { category, topic, description, sortOrder } = req.body;
      
      if (!category || !topic) {
        return res.status(400).json({ success: false, error: '分类和主题为必填项' });
      }
      
      const result = db.prepare(`
        INSERT INTO popular_topics (category, topic, description, sort_order, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000)
      `).run(category, topic, description || '', sortOrder || 0);
      
      res.json({ 
        success: true, 
        data: { 
          id: result.lastInsertRowid,
          category,
          topic,
          description,
          sortOrder,
        }
      });
    } catch (error) {
      console.error('添加热门主题失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 更新热门主题
  router.put('/popular-topics/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { category, topic, description, sortOrder, enabled } = req.body;
      
      const updates = [];
      const values = [];
      
      if (category !== undefined) {
        updates.push('category = ?');
        values.push(category);
      }
      if (topic !== undefined) {
        updates.push('topic = ?');
        values.push(topic);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      if (sortOrder !== undefined) {
        updates.push('sort_order = ?');
        values.push(sortOrder);
      }
      if (enabled !== undefined) {
        updates.push('enabled = ?');
        values.push(enabled);
      }
      
      updates.push("updated_at = strftime('%s', 'now') * 1000");
      values.push(id);
      
      db.prepare(`UPDATE popular_topics SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      
      res.json({ success: true });
    } catch (error) {
      console.error('更新热门主题失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 删除热门主题
  router.delete('/popular-topics/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.prepare('DELETE FROM popular_topics WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      console.error('删除热门主题失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
