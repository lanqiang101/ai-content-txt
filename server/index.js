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
  res.header('Access-Control-Allow-Headers', 'Content-Type');
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
