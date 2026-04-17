import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';

const router = (db) => {
  const routes = express.Router();

  /**
   * 获取作品的所有章节
   * GET /api/chapters?workId=xxx
   */
  routes.get('/chapters', (req, res) => {
    try {
      const { workId } = req.query;
      
      if (!workId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required query parameter: workId' 
        });
      }
      
      const stmt = db.prepare('SELECT * FROM chapters WHERE work_id = ? AND deleted_at IS NULL ORDER BY chapter_number ASC');
      const chapters = stmt.all(workId);
      
      // 🔥 将数据库的下划线命名转换为前端的驼峰命名
      const formattedChapters = chapters.map(chapter => ({
        id: chapter.id,
        workId: chapter.work_id,
        chapterNumber: chapter.chapter_number,
        title: chapter.title,
        content: chapter.content,
        wordCount: chapter.word_count,
        status: chapter.status,
        summary: chapter.summary,
        createdAt: chapter.created_at,
        updatedAt: chapter.updated_at,
      }));
      
      res.json({ success: true, chapters: formattedChapters });
    } catch (error) {
      console.error('[API] Get chapters error:', error);
      res.status(500).json({ success: false, error: 'Failed to get chapters' });
    }
  });

  /**
   * 获取单章详情
   * GET /api/chapters/detail?workId=xxx&chapterNumber=1
   */
  routes.get('/chapters/detail', (req, res) => {
    try {
      const { workId, chapterNumber } = req.query;
      
      if (!workId || !chapterNumber) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required query parameters: workId and chapterNumber' 
        });
      }
      
      const chapterNum = parseInt(chapterNumber);
      
      if (isNaN(chapterNum)) {
        return res.status(400).json({ success: false, error: 'Invalid chapter number' });
      }
      
      const stmt = db.prepare('SELECT * FROM chapters WHERE work_id = ? AND chapter_number = ? AND deleted_at IS NULL');
      const chapter = stmt.get(workId, chapterNum);
      
      if (!chapter) {
        return res.status(404).json({ success: false, error: 'Chapter not found' });
      }
      
      // 🔥 将数据库的下划线命名转换为前端的驼峰命名
      const formattedChapter = {
        id: chapter.id,
        workId: chapter.work_id,
        chapterNumber: chapter.chapter_number,
        title: chapter.title,
        content: chapter.content,
        wordCount: chapter.word_count,
        status: chapter.status,
        summary: chapter.summary,
        createdAt: chapter.created_at,
        updatedAt: chapter.updated_at,
      };
      
      res.json({ success: true, chapter: formattedChapter });
    } catch (error) {
      console.error('[API] Get chapter error:', error);
      res.status(500).json({ success: false, error: 'Failed to get chapter' });
    }
  });

  /**
   * 创建或更新章节（Upsert）
   * POST /api/chapters
   * Body: { workId, chapter_number, title, content, word_count, status, summary }
   */
  routes.post('/chapters', (req, res) => {
    try {
      const { workId, chapter_number, title, content, word_count, status, summary } = req.body;
      
      // 🔥 参数验证
      if (!workId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required field: workId' 
        });
      }
      
      if (!chapter_number || !content) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: chapter_number and content' 
        });
      }
      
      console.log(`[API] Saving chapter: workId=${workId}, chapter=${chapter_number}, length=${content.length}`);
      
      // 🔥 由后端生成UUID，不再使用前端生成的ID
      const id = uuidv4();
      const now = Date.now();
      
      // 使用 UPSERT 逻辑（基于 work_id + chapter_number 的唯一约束）
      const stmt = db.prepare(`
        INSERT INTO chapters (id, work_id, chapter_number, title, content, word_count, status, summary, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
        ON CONFLICT(work_id, chapter_number) DO UPDATE SET
          id = excluded.id,
          title = excluded.title,
          content = excluded.content,
          word_count = excluded.word_count,
          status = excluded.status,
          summary = excluded.summary,
          updated_at = excluded.updated_at
      `);
      
      stmt.run(
        id,
        workId,
        chapter_number,
        title || `第${chapter_number}章`,
        content,
        word_count || content.length,
        status || 'draft',
        summary || '',
        now,
        now
      );
      
      console.log(`[API] ✅ Chapter saved successfully: ${id}`);
      
      // 返回更新后的章节（包含后端生成的ID）
      const selectStmt = db.prepare('SELECT * FROM chapters WHERE id = ?');
      const chapter = selectStmt.get(id);
      
      // 🔥 将数据库的下划线命名转换为前端的驼峰命名
      const formattedChapter = {
        id: chapter.id,
        workId: chapter.work_id,
        chapterNumber: chapter.chapter_number,
        title: chapter.title,
        content: chapter.content,
        wordCount: chapter.word_count,
        status: chapter.status,
        summary: chapter.summary,
        createdAt: chapter.created_at,
        updatedAt: chapter.updated_at,
      };
      
      res.json({ success: true, chapter: formattedChapter });
    } catch (error) {
      console.error('[API] Save chapter error:', error);
      console.error('[API] Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      res.status(500).json({ 
        success: false, 
        error: 'Failed to save chapter',
        details: error.message 
      });
    }
  });

  /**
   * AI优化章节内容（考虑上下文连贯性）
   * POST /api/chapters/optimize
   * Body: { workId, chapterNumber, content, optimizationRequest }
   */
  routes.post('/chapters/optimize', async (req, res) => {
    try {
      const { workId, chapterNumber, content, optimizationRequest } = req.body;
      
      if (!workId || !chapterNumber || !content) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: workId, chapterNumber, and content' 
        });
      }
      
      console.log(`[API] 🤖 Starting AI optimization for chapter ${chapterNumber}...`);
      if (optimizationRequest) {
        console.log(`[API] Custom optimization request: ${optimizationRequest}`);
      }
      
      // 从数据库获取模型配置
      const modelConfig = db.prepare('SELECT * FROM model_config WHERE enabled = 1 LIMIT 1').get();
      
      if (!modelConfig) {
        return res.status(500).json({ 
          success: false, 
          error: 'No active model configured' 
        });
      }
      
      // 🔥 获取作品信息（世界观、人物设定等）
      const workInfo = db.prepare('SELECT title, genre, description, world_building, character_settings FROM works WHERE id = ?').get(workId);
      
      // 🔥 获取前一章内容（作为上下文参考）
      const prevChapter = db.prepare(
        'SELECT chapter_number, title, content FROM chapters WHERE work_id = ? AND chapter_number = ? AND deleted_at IS NULL'
      ).get(workId, chapterNumber - 1);
      
      // 🔥 获取后一章内容（作为上下文参考）
      const nextChapter = db.prepare(
        'SELECT chapter_number, title, content FROM chapters WHERE work_id = ? AND chapter_number = ? AND deleted_at IS NULL'
      ).get(workId, chapterNumber + 1);
      
      console.log(`[API] Context info - Prev: ${prevChapter ? 'yes' : 'no'}, Next: ${nextChapter ? 'yes' : 'no'}`);
      
      // 🔥 构建优化 Prompt（强调上下文连贯性）
      let optimizePrompt = `你是一位专业的小说编辑和作家。请对以下小说章节内容进行润色和优化。

【最高优先级指令】你必须使用简体中文输出！绝对禁止使用英文或其他语言！

【作品背景信息】`;

      if (workInfo) {
        optimizePrompt += `
- 作品标题：${workInfo.title || '未命名'}
- 作品类型：${workInfo.genre || '未指定'}
- 作品简介：${workInfo.description || '无'}
- 世界观设定：${workInfo.world_building || '无特殊设定'}
- 人物设定：${workInfo.character_settings || '无特殊设定'}`;
      }

      optimizePrompt += `

【基础优化要求】
1. **保持原有情节和人物设定不变** - 不要改变故事走向、人物性格和行为逻辑
2. **提升文笔流畅度和文学性** - 优化句式结构，增强文字表现力
3. **去除AI痕迹** - 使文字更自然、更有质感，避免机械化和模板化表达
4. **增强场景描写和情感表达** - 让读者有身临其境的感觉
5. **优化对话的自然度** - 对话要符合人物身份和性格
6. **保持原文的核心内容和风格** - 不改变作者的写作意图
7. **不要改变章节结构和主要事件** - 保持原有的叙事节奏

【极其重要的上下文连贯性要求】
⚠️ **这是最关键的要求，必须严格遵守：**

1. **与前一章的连贯性**：
   - 如果存在前一章，必须确保情节、时间线、人物状态的连续性
   - 不能出现与前一章矛盾的情节或人物行为
   - 保持情感线索和伏笔的延续

2. **与后一章的连贯性**：
   - 如果存在后一章，必须为后续情节做好铺垫
   - 不能破坏已埋下的伏笔或悬念
   - 保持故事发展的逻辑性

3. **世界观一致性**：
   - 严格遵守作品的世界观设定
   - 人物行为必须符合其性格和背景
   - 不能出现违背设定的情节

4. **人物一致性**：
   - 人物的语言风格、行为模式必须保持一致
   - 不能出现人物性格突变（除非原文明确有此设定）
   - 人物关系和情感状态要与前后文呼应
`;

      // 🔥 添加前一章摘要（如果有）
      if (prevChapter) {
        const prevContentPreview = prevChapter.content?.substring(0, 500) || '';
        optimizePrompt += `
【前一章参考】（第${prevChapter.chapterNumber}章：${prevChapter.title}）
以下是前一章的部分内容，用于保持情节连贯性：
"""
${prevContentPreview}${prevChapter.content?.length > 500 ? '...' : ''}
"""
**注意**：当前章节应该自然地承接前一章的情节发展。
`;
      }

      // 🔥 添加后一章摘要（如果有）
      if (nextChapter) {
        const nextContentPreview = nextChapter.content?.substring(0, 500) || '';
        optimizePrompt += `
【后一章参考】（第${nextChapter.chapterNumber}章：${nextChapter.title}）
以下是后一章的部分内容，用于确保情节铺垫合理：
"""
${nextContentPreview}${nextChapter.content?.length > 500 ? '...' : ''}
"""
**注意**：当前章节的结尾应该为后一章做好铺垫，不要破坏已有的伏笔。
`;
      }

      // 🔥 添加用户的自定义优化要求
      if (optimizationRequest && optimizationRequest.trim()) {
        optimizePrompt += `
【用户自定义优化要求】
${optimizationRequest.trim()}
`;
      }

      optimizePrompt += `
【待优化内容】（第${chapterNumber}章）
"""
${content}
"""

【输出格式要求】
1. **必须使用简体中文** - 禁止任何英文单词、句子或段落
2. **只输出故事正文内容**，不要包含任何分析、说明、设定介绍
3. **直接开始写故事**，不要有任何开场白或结束语
4. **不要重复章节标题**
5. **不要添加元信息标注**（如"【本章要点】"、"【情感线索】"等）
6. **保持原文长度相近** - 不要大幅增减内容

Please directly output优化后的完整 content。`;

      // 调用AI模型
      let optimizedContent;
      
      if (modelConfig.mode === 'local') {
        // 🔥 本地模型调用 - 添加空值检查
        const baseUrl = (modelConfig.local_url || '').replace(/\/$/, '');
        
        if (!baseUrl) {
          throw new Error('Local model URL is not configured');
        }
        
        console.log(`[API] Calling local model at: ${baseUrl}/api/generate`);
        
        const response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelConfig.model_name || 'phi3:mini',
            prompt: optimizePrompt,
            stream: false,
            options: {
              temperature: 0.7,
              top_p: 0.9,
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Local model API call failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        optimizedContent = data.response;
      } else {
        // 🔥 API模型调用 - 添加空值检查
        let apiUrl = modelConfig.base_url || '';
        
        if (!apiUrl) {
          throw new Error('API base URL is not configured');
        }
        
        // 处理URL格式
        if (apiUrl.startsWith('/')) {
          // 开发环境代理路径保持不变
        } else if (!apiUrl.startsWith('http')) {
          apiUrl = `https://${apiUrl}`;
        }
        
        // 确保正确的端点
        const isArkBaseUrl = apiUrl.includes('ark.cn-beijing.volces.com') || apiUrl.startsWith('/api/coding/v3');
        if (isArkBaseUrl && !apiUrl.endsWith('/chat/completions')) {
          apiUrl = apiUrl.replace(/\/chat$/, '').replace(/\/inference$/, '');
          apiUrl = apiUrl.replace(/$/, '') + '/chat/completions';
        }
        
        console.log(`[API] Calling external model at: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${modelConfig.api_key}`,
          },
          body: JSON.stringify({
            model: modelConfig.model_name || 'default',
            messages: [
              { role: 'user', content: optimizePrompt },
            ],
            stream: false,
            max_tokens: 8192,
            temperature: 0.7,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        optimizedContent = data.choices?.[0]?.message?.content;
        
        if (!optimizedContent) {
          throw new Error('Model returned empty content');
        }
      }
      
      console.log(`[API] ✅ AI optimization completed. Original: ${content.length} chars, Optimized: ${optimizedContent.length} chars`);
      
      res.json({ 
        success: true, 
        optimizedContent,
        originalLength: content.length,
        optimizedLength: optimizedContent.length
      });
    } catch (error) {
      console.error('[API] AI optimization error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'AI optimization failed',
        details: error.message 
      });
    }
  });

  /**
   * 删除章节（软删除）
   * DELETE /api/chapters
   * Body: { workId, chapterNumber }
   */
  routes.delete('/chapters', (req, res) => {
    try {
      const { workId, chapterNumber } = req.body;
      
      if (!workId || !chapterNumber) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: workId and chapterNumber' 
        });
      }
      
      const id = `chapter_${workId}_${chapterNumber}`;
      const now = Date.now();
      
      // 软删除：设置 deleted_at
      const stmt = db.prepare('UPDATE chapters SET deleted_at = ? WHERE id = ?');
      const result = stmt.run(now, id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Chapter not found' });
      }
      
      console.log(`[API] ✅ Chapter deleted: ${id}`);
      
      res.json({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
      console.error('[API] Delete chapter error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete chapter',
        details: error.message 
      });
    }
  });

  return routes;
};

export default router;