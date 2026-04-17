import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

export default function (db) {
  // 获取作品的所有角色
  router.get('/characters/work/:workId', (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  // 根据ID获取角色
  router.get('/characters/:id', (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  // 创建角色
  router.post('/characters', (req, res) => {
    try {
      const character = req.body;
      const now = Date.now();
      
      // 🔥 由后端生成UUID
      const characterId = uuidv4();
      
      const stmt = db.prepare(`
        INSERT INTO characters (
          id, work_id, name, description, appearance, personality, outfit,
          role, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        characterId,  // 🔥 使用后端生成的ID
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
      
      // 🔥 返回包含后端生成ID的完整角色数据
      res.json({
        ...character,
        id: characterId,
      });
    } catch (error) {
      console.error('[Characters] Add character error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 更新角色
  router.put('/characters/:id', (req, res) => {
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
        updatedAt: Number(result.updated_at),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 删除角色
  router.delete('/characters/:id', (req, res) => {
    try {
      const result = db.prepare('UPDATE characters SET deleted_at = ? WHERE id = ?').run(Date.now(), req.params.id);
      res.json({ success: result.changes > 0 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}