import { pipeline } from '@xenova/transformers';

class EmbeddingService {
  private extractor: any = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化模型（懒加载）
   */
  async init(): Promise<void> {
    if (this.extractor) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        console.log('[Embedding] 🔄 Loading Xenova/all-MiniLM-L6-v2 model...');
        this.extractor = await pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2',
          {
            // 使用本地缓存，避免重复下载
            cache_dir: '/tmp/xenova-cache',
          }
        );
        console.log('[Embedding] ✅ Model loaded successfully');
      } catch (error) {
        console.error('[Embedding] ❌ Failed to load model:', error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * 生成单个文本的嵌入向量
   */
  async embed(text: string): Promise<number[]> {
    if (!this.extractor) {
      await this.init();
    }

    try {
      const output = await this.extractor(text, {
        pooling: 'mean',
        normalize: true,
      });

      // 转换为普通数组
      return Array.from(output.data);
    } catch (error) {
      console.error('[Embedding] Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * 批量生成嵌入向量
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.embed(text);
        embeddings.push(embedding);
      } catch (error) {
        console.warn(`[Embedding] Failed to embed text: ${text.substring(0, 50)}...`, error);
        // 返回零向量作为降级
        embeddings.push(new Array(384).fill(0));
      }
    }
    
    return embeddings;
  }

  /**
   * 计算余弦相似度
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * 检查模型是否已加载
   */
  isReady(): boolean {
    return this.extractor !== null;
  }
}

export const embeddingService = new EmbeddingService();
