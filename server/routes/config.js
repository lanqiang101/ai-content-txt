import express from 'express';

const router = express.Router();

export default function (db) {
  // ========== 流水线配置 ==========
  router.get('/config/pipeline', (req, res) => {
    try {
      const configs = db.prepare('SELECT * FROM pipeline_config ORDER BY created_at DESC').all();
      res.json(configs.map(row => ({...row, config: JSON.parse(row.config)})));
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.post('/config/pipeline', (req, res) => {
    try {
      const config = req.body;
      const now = Date.now();
      const stmt = db.prepare('INSERT INTO pipeline_config (id, name, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
      stmt.run(config.id, config.name, JSON.stringify(config.config), now, now);
      res.json(config);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.put('/config/pipeline/:id', (req, res) => {
    try {
      const config = req.body;
      const now = Date.now();
      const stmt = db.prepare('UPDATE pipeline_config SET name = ?, config = ?, updated_at = ? WHERE id = ?');
      stmt.run(config.name, JSON.stringify(config.config), now, config.id);
      res.json(config);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.delete('/config/pipeline/:id', (req, res) => {
    try {
      const result = db.prepare('DELETE FROM pipeline_config WHERE id = ?').run(req.params.id);
      res.json({success: result.changes > 0});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // ========== 模型配置 ==========
  router.get('/config/models/getList', (req, res) => {
    try {
      const models = db.prepare('SELECT * FROM model_config ORDER BY id ASC').all();
      // 转换数据库下划线命名字段到前端驼峰命名
      const convertedModels = models.map(m => ({
        id: m.id,
        name: m.name,
        mode: m.mode,
        modelName: m.model_name,
        apiKey: m.api_key,
        baseUrl: m.base_url,
        maxTokens: m.max_tokens,
        temperature: m.temperature,
        enabled: Boolean(m.enabled),
        createdAt: Number(m.created_at),
        updatedAt: Number(m.updated_at),
      }));
      res.json(convertedModels.filter(m => m.enabled));
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.get('/config/models', (req, res) => {
    try {
      const models = db.prepare('SELECT * FROM model_config ORDER BY id ASC').all();
      // 转换数据库下划线命名字段到前端驼峰命名
      const convertedModels = models.map(m => ({
        id: m.id,
        name: m.name,
        mode: m.mode,
        modelName: m.model_name,
        apiKey: m.api_key,
        baseUrl: m.base_url,
        maxTokens: m.max_tokens,
        temperature: m.temperature,
        enabled: Boolean(m.enabled),
        createdAt: Number(m.created_at),
        updatedAt: Number(m.updated_at),
      }));
      res.json(convertedModels.filter(m => m.enabled));
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.get('/config/models/:id', (req, res) => {
    try {
      const model = db.prepare('SELECT * FROM model_config WHERE id = ?').get(req.params.id);
      if (!model) return res.json(null);
      // 转换下划线到驼峰
      res.json({
        id: model.id,
        name: model.name,
        mode: model.mode,
        modelName: model.model_name,
        apiKey: model.api_key,
        baseUrl: model.base_url,
        maxTokens: model.max_tokens,
        temperature: model.temperature,
        enabled: Boolean(model.enabled),
        createdAt: Number(model.created_at),
        updatedAt: Number(model.updated_at),
      });
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 兼容两种路径：/config/models 和 /config/models/add
  router.post('/config/models', (req, res) => {
    try {
      // 兼容前端驼峰命名和后端下划线命名
      const { 
        name, 
        modelName, 
        model_name,
        apiKey, 
        api_key,
        baseUrl, 
        base_url,
        maxTokens, 
        max_tokens,
        temperature,
        mode,
        enabled
      } = req.body;
      const now = Date.now();
      const stmt = db.prepare(`
        INSERT INTO model_config (name, model_name, api_key, base_url, max_tokens, temperature, mode, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      // 数一数：10 columns → 10 params
      const result = stmt.run(
        name ?? null,
        (modelName ?? model_name) ?? null,
        (apiKey ?? api_key) ?? null,
        (baseUrl ?? base_url) ?? null,
        (maxTokens ?? max_tokens) ?? null,
        temperature ?? null,
        mode ?? null,
        enabled !== undefined ? Number(enabled) : 1,
        now,
        now
      );
      res.json({ id: result.lastInsertRowid, ...req.body, enabled: enabled !== undefined ? Number(enabled) : 1 });
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.post('/config/models/add', (req, res) => {
    try {
      // 兼容前端驼峰命名和后端下划线命名
      const { 
        name, 
        modelName, 
        model_name,
        apiKey, 
        api_key,
        baseUrl, 
        base_url,
        maxTokens, 
        max_tokens,
        temperature,
        mode,
        enabled
      } = req.body;
      const now = Date.now();
      const stmt = db.prepare(`
        INSERT INTO model_config (name, model_name, api_key, base_url, max_tokens, temperature, mode, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      // 数一数：10 columns → 10 params
      const result = stmt.run(
        name ?? null,
        (modelName ?? model_name) ?? null,
        (apiKey ?? api_key) ?? null,
        (baseUrl ?? base_url) ?? null,
        (maxTokens ?? max_tokens) ?? null,
        temperature ?? null,
        mode ?? null,
        enabled !== undefined ? Number(enabled) : 1,
        now,
        now
      );
      res.json({ id: result.lastInsertRowid, ...req.body, enabled: enabled !== undefined ? Number(enabled) : 1 });
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.post('/config/models/update', (req, res) => {
    try {
      const { 
        id,
        name, 
        modelName, 
        model_name,
        apiKey, 
        api_key,
        baseUrl, 
        base_url,
        maxTokens, 
        max_tokens,
        temperature,
        mode,
        enabled
      } = req.body;
      const now = Date.now();
      const stmt = db.prepare(`
        UPDATE model_config SET name = COALESCE(?, name),
          model_name = COALESCE(?, model_name),
          api_key = COALESCE(?, api_key),
          base_url = COALESCE(?, base_url),
          max_tokens = COALESCE(?, max_tokens),
          temperature = COALESCE(?, temperature),
          mode = COALESCE(?, mode),
          enabled = COALESCE(?, enabled),
          updated_at = ?
        WHERE id = ?
      `);

      // 强制转换并记录日志
      const params = [
        name ?? null,
        (modelName ?? model_name) ?? null,
        (apiKey ?? api_key) ?? null,
        (baseUrl ?? base_url) ?? null,
        (maxTokens ?? max_tokens) ?? null,
        temperature ?? null,
        mode ?? null,
        enabled != null ? Number(enabled) : null,
        now,
        id ?? null
      ];

      // 检查每个参数的类型
      console.log('Update params with types:');
      params.forEach((p, i) => {
        console.log('  [%d] type=%s, value=', i, typeof p, p);
      });

      stmt.run(...params);
      const model = db.prepare('SELECT * FROM model_config WHERE id = ?').get(id ?? null);
      // 转换返回给前端
      res.json({
        id: model.id,
        name: model.name,
        mode: model.mode,
        modelName: model.model_name,
        apiKey: model.api_key,
        baseUrl: model.base_url,
        maxTokens: model.max_tokens,
        temperature: model.temperature,
        enabled: Boolean(model.enabled),
        createdAt: Number(model.created_at),
        updatedAt: Number(model.updated_at),
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({error: error.message});
    }
  });

  router.put('/config/models/:id', (req, res) => {
    try {
      const { 
        id,
        name, 
        modelName, 
        model_name,
        apiKey, 
        api_key,
        baseUrl, 
        base_url,
        maxTokens, 
        max_tokens,
        temperature,
        mode,
        enabled
      } = req.body;
      const now = Date.now();
      const stmt = db.prepare(`
        UPDATE model_config SET name = COALESCE(?, name),
          model_name = COALESCE(?, model_name),
          api_key = COALESCE(?, api_key),
          base_url = COALESCE(?, base_url),
          max_tokens = COALESCE(?, max_tokens),
          temperature = COALESCE(?, temperature),
          mode = COALESCE(?, mode),
          enabled = COALESCE(?, enabled),
          updated_at = ?
        WHERE id = ?
      `);
      const params = [
        name ?? null,
        (modelName ?? model_name) ?? null,
        (apiKey ?? api_key) ?? null,
        (baseUrl ?? base_url) ?? null,
        (maxTokens ?? max_tokens) ?? null,
        temperature ?? null,
        mode ?? null,
        enabled != null ? Number(enabled) : null,
        now,
        id ?? null
      ];
      stmt.run(...params);
      const model = db.prepare('SELECT * FROM model_config WHERE id = ?').get(req.params.id);
      // 转换返回给前端
      res.json({
        id: model.id,
        name: model.name,
        mode: model.mode,
        modelName: model.model_name,
        apiKey: model.api_key,
        baseUrl: model.base_url,
        maxTokens: model.max_tokens,
        temperature: model.temperature,
        enabled: Boolean(model.enabled),
        createdAt: Number(model.created_at),
        updatedAt: Number(model.updated_at),
      });
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // 兼容两种删除路径
  router.delete('/config/models/:id', (req, res) => {
    try {
      // 软删除：标记为禁用
      const result = db.prepare('UPDATE model_config SET enabled = 0, updated_at = ? WHERE id = ?').run(Date.now(), req.params.id);
      res.json({success: result.changes > 0});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.post('/config/models/delete', (req, res) => {
    try {
      const { id } = req.body;
      // 软删除：标记为禁用
      const result = db.prepare('UPDATE model_config SET enabled = 0, updated_at = ? WHERE id = ?').run(Date.now(), id);
      res.json({success: result.changes > 0});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // ========== 应用配置 ==========
  router.get('/config/app/:key', (req, res) => {
    try {
      const config = db.prepare('SELECT * FROM app_config WHERE key = ?').get(req.params.key);
      res.json(config ? JSON.parse(config.value) : null);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.post('/config/app/:key', (req, res) => {
    try {
      const value = req.body;
      const now = Date.now();
      const stmt = db.prepare('INSERT OR REPLACE INTO app_config (key, value, updated_at) VALUES (?, ?, ?)');
      stmt.run(req.params.key, JSON.stringify(value), now);
      res.json(value);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  // ========== 系统配置 ==========
  router.get('/config/system/getConfig', (req, res) => {
    try {
      const configs = db.prepare('SELECT * FROM app_config').all();
      const result = {};
      
      // 🔥 存储是 xxx_model_id，读取时需要映射回短名给前端表单绑定
      const stageKeys = [
        'stage1_model_id', 
        'stage2_model_id', 
        'stage3_model_id', 
        'random_model_id', 
        'storyboard_model_id',
        'chapter_continuation_model_id',  // 🔥 新增：章节续写
        'chapter_optimization_model_id',  // 🔥 新增：章节优化
        'popular_topics_model_id'         // 🔥 新增：热门主题
      ];
      
      configs.forEach(row => {
        if (row.value === null) {
          result[row.key] = null;
        } else {
          result[row.key] = JSON.parse(row.value);
        }
      });
      
      // 🔥 蛇形命名转驼峰命名的工具函数
      const snakeToCamel = (str) => {
        return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      };
      
      // 🔥 把 xxx_model_id 的值映射回驼峰短名给前端绑定
      stageKeys.forEach(dbKey => {
        if (result[dbKey] !== undefined) {
          // chapter_continuation_model_id → chapterContinuation
          const shortKey = dbKey.replace('_model_id', '');
          const frontKey = snakeToCamel(shortKey);
          result[frontKey] = result[dbKey];
        }
      });
      
      res.json(result);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.post('/config/system/save', (req, res) => {
    try {
      // 支持两种格式：直接是配置对象，或者 { config: ... }
      const config = req.body.config || req.body;
      const now = Date.now();
      
      console.log('Saving system config:', Object.keys(config));
      
      // 🔥 前端发送的包含 {stage1: modelId, stage2: modelId, chapterContinuation: modelId, ...}
      // 需要把短名存储为 {stage1_model_id: modelId, chapter_continuation_model_id: modelId, ...}
      // 驼峰转蛇形命名映射表
      const camelToSnakeMap = {
        'stage1': 'stage1',
        'stage2': 'stage2',
        'stage3': 'stage3',
        'random': 'random',
        'storyboard': 'storyboard',
        'chapterContinuation': 'chapter_continuation',  // 🔥 新增：章节续写
        'chapterOptimization': 'chapter_optimization',  // 🔥 新增：章节优化
        'popularTopics': 'popular_topics'               // 🔥 新增：热门主题
      };
      
      // 批量保存所有配置项
      for (const [key, value] of Object.entries(config)) {
        let dbKey = key;
        
        // 如果是短名（驼峰），转换为蛇形命名 + _model_id 存储
        if (camelToSnakeMap[key]) {
          dbKey = `${camelToSnakeMap[key]}_model_id`;
        }
        
        const stmt = db.prepare('INSERT OR REPLACE INTO app_config (key, value, updated_at) VALUES (?, ?, ?)');
        // null值直接存储为SQL null，其他值JSON序列化
        const storedValue = value === null ? null : JSON.stringify(value);
        stmt.run(dbKey, storedValue, now);
        console.log('  Saved: %s → %s, value=%s', key, dbKey, JSON.stringify(value));
      }
      
      console.log('System config save completed');
      res.json({success: true});
    } catch (error) {
      console.error('Save system config error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // ========== 生成参数配置 ==========
  router.get('/config/generation-params', (req, res) => {
    try {
      const paramsList = db.prepare('SELECT * FROM generation_params ORDER BY created_at DESC').all();
      res.json(paramsList.map(row => ({...row, params: JSON.parse(row.params)})));
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.post('/config/generation-params', (req, res) => {
    try {
      const params = req.body;
      const now = Date.now();
      const stmt = db.prepare('INSERT INTO generation_params (id, name, params, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
      stmt.run(params.id, params.name, JSON.stringify(params.params), now, now);
      res.json(params);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.put('/config/generation-params/:id', (req, res) => {
    try {
      const params = req.body;
      const now = Date.now();
      const stmt = db.prepare('UPDATE generation_params SET name = ?, params = ?, updated_at = ? WHERE id = ?');
      stmt.run(params.name, JSON.stringify(params.params), now, params.id);
      res.json(params);
    } catch (error) {res.status(500).json({error: error.message});}
  });

  router.delete('/config/generation-params/:id', (req, res) => {
    try {
      const result = db.prepare('DELETE FROM generation_params WHERE id = ?').run(req.params.id);
      res.json({success: result.changes > 0});
    } catch (error) {res.status(500).json({error: error.message});}
  });

  return router;
}
