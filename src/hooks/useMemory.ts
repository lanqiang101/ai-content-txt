import { useCallback } from 'react';
import { embeddingService } from '../services/embedding';

/**
 * 记忆管理Hook（增强版 - 使用语义嵌入）
 * 用于在生成过程中检索和存储记忆
 */
export const useMemory = () => {
  /**
   * 检索相关记忆（使用语义相似度）
   * @param query - 查询文本
   * @param topK - 返回数量
   * @param filterType - 过滤类型
   */
  const retrieveMemory = useCallback(async (
    query: string,
    topK: number = 5,
    filterType?: string
  ): Promise<string> => {
    try {
      // 🔥 尝试使用语义搜索
      if (embeddingService.isReady()) {
        try {
          console.log('[Memory] Using semantic search...');
          const response = await fetch('/api/memory/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query, 
              topK, 
              filterType,
              useSemanticSearch: true 
            }),
          });

          const data = await response.json();
          
          if (data.success && data.formatted) {
            console.log(`[Memory] ✅ Semantic search retrieved ${data.results?.length || 0} memories`);
            return data.formatted;
          }
        } catch (error) {
          console.warn('[Memory] Semantic search failed, falling back to keyword search:', error);
        }
      }
      
      // 🔥 降级到关键词搜索
      console.log('[Memory] Using keyword search...');
      const response = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK, filterType }),
      });

      const data = await response.json();
      
      if (!data.success || !data.formatted) {
        return '';
      }

      console.log(`[Memory] Retrieved ${data.results?.length || 0} memories`);
      return data.formatted;
    } catch (error) {
      console.error('[Memory] Retrieve failed:', error);
      return '';
    }
  }, []);

  /**
   * 添加章节记忆（带嵌入向量）
   */
  const addChapterMemory = useCallback(async (
    chapterId: string,
    title: string,
    content: string,
    summary: string
  ) => {
    try {
      // 🔥 生成内容嵌入向量（异步，不阻塞）
      let embedding: number[] | null = null;
      try {
        if (embeddingService.isReady()) {
          // 使用摘要生成嵌入，节省计算资源
          const textToEmbed = `${title} ${summary}`;
          embedding = await embeddingService.embed(textToEmbed);
        }
      } catch (error) {
        console.warn('[Memory] Failed to generate embedding, continuing without it:', error);
      }

      await fetch('/api/memory/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          title,
          content,
          summary,
          embedding, // 🔥 添加嵌入向量
        }),
      });
      console.log(`[Memory] Added chapter memory: ${title}${embedding ? ' (with embedding)' : ''}`);
    } catch (error) {
      console.error('[Memory] Add chapter failed:', error);
    }
  }, []);

  /**
   * 添加人物记忆
   */
  const addCharacterMemory = useCallback(async (
    id: string,
    name: string,
    description: string,
    currentStatus: string,
    events: string[] = []
  ) => {
    try {
      await fetch('/api/memory/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          description,
          currentStatus,
          events,
          content: `${name}: ${description}`,
        }),
      });
      console.log(`[Memory] Added character memory: ${name}`);
    } catch (error) {
      console.error('[Memory] Add character failed:', error);
    }
  }, []);

  return {
    retrieveMemory,
    addChapterMemory,
    addCharacterMemory,
  };
};
