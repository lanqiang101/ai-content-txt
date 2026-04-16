/**
 * Node.js 后端服务
 * 提供 SQLite API，数据库文件实际存储在移动硬盘 /Volumes/Seagate Exp/xm_db
 */

import express from 'express';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Import route modules
import worksRouter from './routes/works.js';
import charactersRouter from './routes/characters.js';
import storyboardsRouter from './routes/storyboards.js';
import outlinesRouter from './routes/outlines.js';
import historyRouter from './routes/history.js';
import configRouter from './routes/config.js';
import novelMemoryRouter from './routes/novel-memory.js';
import popularTopicsRouter from './routes/popular-topics.js';
import { NovelMemoryManager } from './utils/memory-manager.js';

const PORT = 3000;
const DB_DIR = '/Volumes/Seagate Exp/xm_db';
const DB_PATH = path.join(DB_DIR, 'ai-content-txt.db');

// 确保目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log(`📁 创建目录: ${DB_DIR}`);
}

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 初始化数据库
let db;
try {
  db = new Database(DB_PATH);
  console.log(`✅ 数据库连接成功: ${DB_PATH}`);
  initDatabase(db);
} catch (error) {
  console.error('❌ 数据库连接失败:', error);
  process.exit(1);
}

// 初始化数据表
function initDatabase(db) {
  // 作品表
  db.exec(`
    CREATE TABLE IF NOT EXISTS works (
      id TEXT PRIMARY KEY,
      title TEXT,
      topic TEXT,
      keywords TEXT,
      type TEXT,
      expected_word_count INTEGER,
      actual_word_count INTEGER,
      chapter_count INTEGER,
      status TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      deleted_at INTEGER,
      storyboard_ids TEXT,
      content TEXT,
      generation_params TEXT
    )
  `);

  // 章节表
  db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      work_id TEXT,
      chapter_number INTEGER,
      title TEXT,
      summary TEXT,
      content TEXT,
      word_count INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      deleted_at INTEGER
    )
  `);

  // 角色表
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      work_id TEXT,
      name TEXT,
      description TEXT,
      appearance TEXT,
      personality TEXT,
      outfit TEXT,
      role TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      deleted_at INTEGER
    )
  `);

  // 分镜表
  db.exec(`
    CREATE TABLE IF NOT EXISTS storyboards (
      id TEXT PRIMARY KEY,
      work_id TEXT,
      config TEXT,
      prompts TEXT,
      total_duration REAL,
      created_at INTEGER,
      deleted_at INTEGER
    )
  `);

  // 生成历史记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_history (
      id TEXT PRIMARY KEY,
      type TEXT,
      topic TEXT,
      result TEXT,
      created_at INTEGER,
      deleted_at INTEGER
    )
  `);

  // 小说大纲表
  db.exec(`
    CREATE TABLE IF NOT EXISTS book_outlines (
      id TEXT PRIMARY KEY,
      work_id TEXT,
      chapters TEXT,
      created_at INTEGER,
      deleted_at INTEGER
    )
  `);

  // 流水线配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS pipeline_config (
      id TEXT PRIMARY KEY,
      name TEXT,
      config TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // 生成参数配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS generation_params (
      id TEXT PRIMARY KEY,
      name TEXT,
      params TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // 模型配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS model_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      api_key TEXT,
      base_url TEXT,
      model_name TEXT,
      max_tokens INTEGER,
      temperature REAL,
      mode TEXT,
      enabled INTEGER,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // 定时器配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS timer_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      enabled INTEGER,
      interval_seconds INTEGER,
      last_run_at INTEGER,
      created_at INTEGER
    )
  `);

  // 应用配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER
    )
  `);

  // 热门主题推荐表
  db.exec(`
    CREATE TABLE IF NOT EXISTS popular_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // 创建索引以加速查询
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_popular_topics_category ON popular_topics(category)
  `);

  // 插入默认热门主题数据
  const existingTopics = db.prepare('SELECT COUNT(*) as count FROM popular_topics').get();
  if (existingTopics.count === 0) {
    const defaultTopics = [
      // 都市类
      { category: '都市', topic: '职场逆袭', description: '从底层员工到行业精英的奋斗历程', sort_order: 1 },
      { category: '都市', topic: '创业故事', description: '白手起家打造商业帝国的传奇', sort_order: 2 },
      { category: '都市', topic: '豪门恩怨', description: '家族内部的权力斗争与情感纠葛', sort_order: 3 },
      
      // 玄幻类
      { category: '玄幻', topic: '废柴崛起', description: '天赋被废后重新踏上修炼之路', sort_order: 10 },
      { category: '玄幻', topic: '系统流', description: '获得神秘系统辅助快速成长', sort_order: 11 },
      { category: '玄幻', topic: '穿越异界', description: '现代人穿越到异世界开启新人生', sort_order: 12 },
      
      // 悬疑类
      { category: '悬疑', topic: '密室逃脱', description: '被困神秘空间寻找逃生线索', sort_order: 20 },
      { category: '悬疑', topic: '连环谜案', description: '侦探破解一系列离奇案件', sort_order: 21 },
      { category: '悬疑', topic: '心理惊悚', description: '深入探索人性黑暗面的恐怖故事', sort_order: 22 },
      
      // 言情类
      { category: '言情', topic: '青梅竹马', description: '从小一起长大的纯真爱情故事', sort_order: 30 },
      { category: '言情', topic: '霸道总裁', description: '强势男主与独立女主的爱情博弈', sort_order: 31 },
      { category: '言情', topic: '先婚后爱', description: '契约婚姻中逐渐产生的真感情', sort_order: 32 },
    ];
    
    const insertStmt = db.prepare(`
      INSERT INTO popular_topics (category, topic, description, sort_order, enabled, created_at, updated_at)
      VALUES (@category, @topic, @description, @sort_order, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000)
    `);
    
    const insertMany = db.transaction((topics) => {
      for (const topic of topics) {
        insertStmt.run(topic);
      }
    });
    
    insertMany(defaultTopics);
    console.log('✅ 已插入默认热门主题数据');
  }

  console.log('✅ 所有数据表初始化完成');
}

// 初始化记忆管理系统
let memoryManager;
async function initMemoryManager() {
  try {
    memoryManager = new NovelMemoryManager(db);
    const success = await memoryManager.init();
    if (success) {
      console.log('✅ 记忆管理系统初始化成功 (使用 Xenova/all-MiniLM-L6-v2 模型)');
    } else {
      console.warn('⚠️ 记忆管理系统初始化失败，相关功能将不可用');
    }
  } catch (error) {
    console.error('❌ 记忆管理系统初始化异常:', error.message);
  }
}

// ========== 启动服务器 ==========
app.listen(PORT, async () => {
  console.log(`🚀 后端服务启动成功: http://localhost:${PORT}`);
  console.log(`💾 数据库文件: ${DB_PATH}`);
  
  // 先初始化记忆管理系统
  await initMemoryManager();
  
  // 然后挂载需要memoryManager的路由
  app.use('/api/memory', novelMemoryRouter(memoryManager));
  
  console.log('✅ 所有路由已注册');
});

// Mount other routes (不需要memoryManager的路由可以立即挂载)
app.use('/api', worksRouter(db));
app.use('/api', charactersRouter(db));
app.use('/api', storyboardsRouter(db));
app.use('/api', outlinesRouter(db));
app.use('/api', historyRouter(db));
app.use('/api', configRouter(db));
app.use('/api', popularTopicsRouter(db));

// 🔥 全局错误处理中间件 - 优雅处理取消的请求（必须在所有路由之后）
app.use((err, req, res, next) => {
  // 检查是否是请求被取消的错误
  if (err.name === 'AbortError' || err.code === 'ECONNRESET' || err.message?.includes('aborted')) {
    console.log('[Server] ⚠️ Request was cancelled by client');
    return res.status(499).json({ 
      success: false, 
      error: 'Request cancelled',
      message: '客户端已取消请求' 
    });
  }
  
  // 其他错误
  console.error('[Server Error]', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  });
});
