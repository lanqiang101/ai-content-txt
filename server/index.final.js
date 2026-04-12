      updatedAt: Number(result.updated_at),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/characters/delete/:id', (req, res) => {
  try {
    const result = db.prepare('UPDATE characters SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
    res.json({success: result.changes > 0});
  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});

// ========== 分镜 API - 操作分离 ==========
app.get('/api/storyboards/getListByWork/:workId', (req, res) => {
  try {
    const storyboards = db.prepare(`SELECT * FROM storyboards WHERE work_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`).all(req.params.workId);
    res.json(storyboards.map(row => ({...row, workId: row.work_id, config: JSON.parse(row.config), prompts: JSON.parse(row.prompts), totalDuration: Number(row.total_duration), createdAt: Number(row.created_at)})));
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.get('/api/storyboards/getInfo/:id', (req, res) => {
  try {
    const storyboard = db.prepare('SELECT * FROM storyboards WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
    if (!storyboard) return res.json(null);
    res.json({...storyboard, workId: storyboard.work_id, config: JSON.parse(storyboard.config), prompts: JSON.parse(storyboard.prompts), totalDuration: Number(storyboard.total_duration), createdAt: Number(storyboard.created_at)});
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/storyboards/add', (req, res) => {
  try {
    const storyboard = req.body;
    const now = Date.now();
    const stmt = db.prepare(`INSERT INTO storyboards (id, work_id, config, prompts, total_duration, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(storyboard.id, storyboard.workId, JSON.stringify(storyboard.config), JSON.stringify(storyboard.prompts), storyboard.totalDuration, storyboard.createdAt || now);
    res.json(storyboard);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/storyboards/delete/:id', (req, res) => {
  try {
    const result = db.prepare('UPDATE storyboards SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
    res.json({success: result.changes > 0});
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

// ========== 小说大纲 API - 操作分离 ==========
app.get('/api/outlines/getListByWork/:workId', (req, res) => {
  try {
    const outlines = db.prepare(`SELECT * FROM book_outlines WHERE work_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`).all(req.params.workId);
    res.json(outlines.map(row => ({id: row.id, workId: row.work_id, chapters: JSON.parse(row.chapters), createdAt: Number(row.created_at)})));
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.get('/api/outlines/getInfo/:id', (req, res) => {
  try {
    const outline = db.prepare('SELECT * FROM book_outlines WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
    if (!outline) return res.json(null);
    res.json({id: outline.id, workId: outline.work_id, chapters: JSON.parse(outline.chapters), createdAt: Number(outline.created_at)});
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/outlines/add', (req, res) => {
  try {
    const outline = req.body;
    const stmt = db.prepare(`INSERT INTO book_outlines (id, work_id, chapters, created_at) VALUES (?, ?, ?, ?)`);
    stmt.run(outline.id, outline.workId, JSON.stringify(outline.chapters), outline.createdAt);
    res.json(outline);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/outlines/update/:id', (req, res) => {
  try {
    const outline = req.body;
    const stmt = db.prepare(`UPDATE book_outlines SET chapters = ? WHERE id = ?`);
    stmt.run(JSON.stringify(outline.chapters), outline.id);
    res.json(outline);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/outlines/delete/:id', (req, res) => {
  try {
    const result = db.prepare('UPDATE book_outlines SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
    res.json({success: result.changes > 0});
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

// ========== 生成历史 API - 操作分离 ==========
app.get('/api/history/getList', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;
    const countResult = db.prepare('SELECT COUNT(*) as count FROM content_history WHERE deleted_at IS NULL').get();
    const history = db.prepare(`SELECT * FROM content_history WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`).all();
    res.json({history, total: Number(countResult.count), page, pageSize});
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/history/add', (req, res) => {
  try {
    const item = req.body;
    const now = Date.now();
    const stmt = db.prepare(`INSERT INTO content_history (id, type, topic, result, created_at) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(item.id, item.type, item.topic, item.result, item.createdAt || now);
    res.json(item);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/history/delete/:id', (req, res) => {
  try {
    const result = db.prepare('UPDATE content_history SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
    res.json({success: result.changes > 0});
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

// ========== 流水线配置 API - 操作分离 ==========
app.get('/api/config/pipeline/getList', (req, res) => {
  try {
    const configs = db.prepare('SELECT * FROM pipeline_config ORDER BY created_at DESC').all();
    res.json(configs.map(row => ({...row, config: JSON.parse(row.config)})));
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/config/pipeline/add', (req, res) => {
  try {
    const config = req.body;
    const now = Date.now();
    const stmt = db.prepare(`INSERT INTO pipeline_config (id, name, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(config.id, config.name, JSON.stringify(config.config), now, now);
    res.json(config);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/config/pipeline/update/:id', (req, res) => {
  try {
    const config = req.body;
    const now = Date.now();
    const stmt = db.prepare(`UPDATE pipeline_config SET name = ?, config = ?, updated_at = ? WHERE id = ?`);
    stmt.run(config.name, JSON.stringify(config.config), now, config.id);
    res.json(config);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/config/pipeline/delete/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM pipeline_config WHERE id = ?').run(req.params.id);
    res.json({success: result.changes > 0});
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

// ========== 模型配置 API - 操作分离 ==========
app.get('/api/config/models/getList', (req, res) => {
  try {
    const models = db.prepare('SELECT * FROM model_config WHERE enabled = 1 ORDER BY id ASC').all();
    res.json(models);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.get('/api/config/models/getInfo/:id', (req, res) => {
  try {
    const model = db.prepare('SELECT * FROM model_config WHERE id = ? AND enabled = 1').get(req.params.id);
    res.json(model || null);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/config/models/add', (req, res) => {
  try {
    const { name, api_key, base_url, model_name, max_tokens, temperature } = req.body;
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO model_config (name, api_key, base_url, model_name, max_tokens, temperature, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);
    const result = stmt.run(name, api_key, base_url, model_name, max_tokens, temperature, now, now);
    res.json({ id: result.lastInsertRowid, ...req.body, enabled: 1 });
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/config/models/update/:id', (req, res) => {
  try {
    const { name, api_key, base_url, model_name, max_tokens, temperature, enabled } = req.body;
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE model_config SET name = COALESCE(?, name),
        api_key = COALESCE(?, api_key),
        base_url = COALESCE(?, base_url),
        model_name = COALESCE(?, model_name),
        max_tokens = COALESCE(?, max_tokens),
        temperature = COALESCE(?, temperature),
        enabled = COALESCE(?, enabled),
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(name, api_key, base_url, model_name, max_tokens, temperature, enabled, now, req.params.id);
    const model = db.prepare('SELECT * FROM model_config WHERE id = ?').get(req.params.id);
    res.json(model);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/api/config/models/delete/:id', (req, res) => {
  try {
    // 软删除：标记为禁用
    const result = db.prepare('UPDATE model_config SET enabled = 0, updated_at = ? WHERE id = ?').run(Date.now(), req.params.id);
    res.json({success: result.changes > 0});
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

// ========== 应用配置 API ==========
app.get('/api/config/app/getInfo/:key', (req, res) => {
  try {
    const config = db.prepare('SELECT * FROM app_config WHERE key = ?').get(req.params.key);
    res.json(config ? JSON.parse(config.value) : null);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

app.post('/config/app/save/:key', (req, res) => {
  try {
    const value = req.body;
    const now = Date.now();
    const stmt = db.prepare(`INSERT OR REPLACE INTO app_config (key, value, updated_at) VALUES (?, ?, ?)`);
    stmt.run(req.params.key, JSON.stringify(value), now);
    res.json(value);
  } catch (error) {res.status(500).json({error: (error as Error).message});}
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log(`🚀 后端服务启动成功: http://localhost:${PORT}`);
  console.log(`💾 数据库文件: ${DB_PATH}`);
});
