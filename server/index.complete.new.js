/**
 * Node.js 后端服务
 * 提供 SQLite API，数据库文件实际存储在移动硬盘 /Volumes/Seagate Exp/xm_db
 */

import express from 'express';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

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

// ========== 作品 API - 操作分离 ==========
app.get('/api/works/getList', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
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
        ...row,
        expectedWordCount: Number(row.expected_word_count),
        actualWordCount: Number(row.actual_word_count),
        storyboardIds: row.storyboard_ids ? JSON.parse(row.storyboard_ids) : undefined,
      })),
      total: Number(totalResult.count),
      page,
      pageSize,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/works/getInfo/:id', (req, res) => {
  try {
    const work = db.prepare('SELECT * FROM works WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
    if (!work) {
      return res.json(null);
    }
    res.json({
      ...work,
      expectedWordCount: Number(work.expected_word_count),
      actualWordCount: Number(work.actual_word_count),
      storyboardIds: work.storyboard_ids ? JSON.parse(work.storyboard_ids) : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/works/getFull/:id', (req, res) => {
  try {
    const work = db.prepare('SELECT * FROM works WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
    if (!work) {
      return res.json(null);
    }
    const chapters = db.prepare('SELECT * FROM chapters WHERE work_id = ? AND deleted_at IS NULL ORDER BY chapter_number ASC').all(req.params.id);
    res.json({
      ...work,
      expectedWordCount: Number(work.expected_word_count),
      actualWordCount: Number(work.actual_word_count),
      storyboardIds: work.storyboard_ids ? JSON.parse(work.storyboard_ids) : undefined,
      chapters: chapters.map(row => ({
        ...row,
        workId: row.work_id,
        chapterNumber: row.chapter_number,
        wordCount: row.word_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/works/add', (req, res) => {
  try {
    const work = req.body;
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO works (
        id, title, topic, keywords, type, expected_word_count, actual_word_count,
        chapter_count, status, created_at, updated_at, storyboard_ids, content, generation_params
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      work.id,
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
      work.generationParams
    );
    res.json(work);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/works/update/:id', (req, res) => {
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
      updates.generationParams,
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
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/works/delete/:id', (req, res) => {
  try {
    const result = db.prepare('UPDATE works SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
    res.json({ success: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/works/getByStatus/:status', (req, res) => {
  try {
    const status = req.params.status;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
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
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/works/getChapters/:id', (req, res) => {
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
    res.status(500).json({ error: (error as Error).message });
  }
});

// ========== 角色 API - 操作分离 ==========
app.get('/api/characters/getListByWork/:workId', (req, res) => {
  try {
    const characters = db.prepare(`
      SELECT * FROM characters WHERE work_id = ? AND deleted_at IS NULL
      ORDER BY created_at ASC
    `).all(req.params.workId);
    res.json(characters.map(row => ({
      ...row,
      workId: row.work_id,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    })));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/characters/getInfo/:id', (req, res) => {
  try {
    const character = db.prepare('SELECT * FROM characters WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
    if (!character) {
      return res.json(null);
    }
    res.json({
      ...character,
      workId: character.work_id,
      createdAt: Number(character.created_at),
      updatedAt: Number(character.updated_at),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/characters/add', (req, res) => {
  try {
    const character = req.body;
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO characters (
        id, work_id, name, description, appearance, personality, outfit,
        role, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      character.id,
      character.workId,
      character.name,
      character.description || null,
      character.appearance || null,
      character.personality || null,
      character.outfit || null,
      character.role,
      character.createdAt || now,
      character.updatedAt || now
    );
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/characters/update/:id', (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const existing = db.prepare('SELECT * FROM characters WHERE id = ? AND deleted_at IS NULL').get(id);
    if (!existing) {
      return res.json(null);
    }

    const updatedAt = Date.now();
    const stmt = db.prepare(`
      UPDATE characters SET
        work_id = COALESCE(?, work_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        appearance = COALESCE(?, appearance),
        personality = COALESCE(?, personality),
        outfit = COALESCE(?, outfit),
        role = COALESCE(?, role),
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      updates.workId ?? null,
      updates.name ?? null,
      updates.description ?? null,
      updates.appearance ?? null,
      updates.personality ?? null,
      updates.outfit ?? null,
      updates.role ?? null,
      updatedAt,
      id
    );

    const result = db.prepare('SELECT * FROM characters WHERE id = ? AND deleted_at IS NULL').get(id);
    res.json({
      ...result,
      workId: result.work_id,
      createdAt: Number(result.created_at),
