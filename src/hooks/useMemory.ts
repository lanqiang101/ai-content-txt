import { useCallback } from 'react';

/**
 * 记忆管理Hook
 * 用于在生成过程中检索和存储记忆
 */
export const useMemory = () => {
  /**
   * 检索相关记忆
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
   * 添加章节记忆
   */
  const addChapterMemory = useCallback(async (
    chapterId: string,
    title: string,
    content: string,
    summary: string
  ) => {
    try {
      await fetch('/api/memory/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          title,
          content,
          summary,
        }),
      });
      console.log(`[Memory] Added chapter memory: ${title}`);
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