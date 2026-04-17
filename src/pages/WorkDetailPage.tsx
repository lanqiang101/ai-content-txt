import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { WorkOverview } from '../components/WorkOverview';
import { ChapterList } from '../components/ChapterList';
import { ChapterEditor } from '../components/ChapterEditor';
import { Chapter } from '../types';
import { ArrowLeft, BookOpen, FileText, Eye } from 'lucide-react';

export const WorkDetailPage: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { works } = useStore();
  
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);
  const [fullContent, setFullContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  // 🔥 调试日志
  useEffect(() => {
    console.log('[WorkDetailPage] === Component Mounted ===');
    console.log('[WorkDetailPage] workId from URL:', workId);
    console.log('[WorkDetailPage] works from Store:', works.length, 'works');
    console.log('[WorkDetailPage] found in Store:', works.find(w => w.id === workId));
  }, []);

  // 查找当前作品
  useEffect(() => {
    if (!workId) {
      console.warn('[WorkDetailPage] No workId provided');
      setError('无效的作品ID');
      setLoading(false);
      return;
    }

    const foundWork = works.find(w => w.id === workId);
    if (foundWork) {
      console.log('[WorkDetailPage] ✅ Found work in Store:', foundWork.title);
      setWork(foundWork);
      setLoading(false);
    } else {
      console.log('[WorkDetailPage] ⚠️ Work not in Store, fetching from backend...');
      fetchWorkFromBackend(workId);
    }
  }, [workId, works]);

  // 从后端获取作品信息
  const fetchWorkFromBackend = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[WorkDetailPage] Fetching work from backend:', id);
      const response = await fetch(`/api/works/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[WorkDetailPage] Backend response:', data);
      
      if (!data) {
        throw new Error('作品不存在');
      }
      
      // 🔥 后端直接返回作品对象，不是 { work: ... }
      setWork(data);
      setLoading(false);
    } catch (error) {
      console.error('[WorkDetailPage] Fetch work error:', error);
      setError(error instanceof Error ? error.message : '加载作品失败');
      setLoading(false);
    }
  };

  // 🔥 加载完整内容
  const loadFullContent = async () => {
    if (!workId || fullContent) return;
    
    try {
      setLoadingContent(true);
      console.log('[WorkDetailPage] Loading full content from backend...');
      console.log('[WorkDetailPage] workId:', workId);
      
      const response = await fetch(`/api/chapters?workId=${workId}`);
      
      console.log('[WorkDetailPage] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[WorkDetailPage] API response:', data);
      
      const chapters = data.chapters || [];
      console.log(`[WorkDetailPage] Chapters count: ${chapters.length}`);
      
      if (chapters.length > 0) {
        console.log('[WorkDetailPage] First chapter sample:', {
          id: chapters[0].id,
          chapterNumber: chapters[0].chapterNumber,
          title: chapters[0].title,
          wordCount: chapters[0].wordCount,
          contentLength: chapters[0].content?.length || 0,
          hasContent: !!chapters[0].content,
        });
      }
      
      // 合并所有章节内容
      const mergedContent = chapters
        .sort((a: Chapter, b: Chapter) => a.chapterNumber - b.chapterNumber)
        .map((ch: Chapter) => {
          const title = ch.title || `第${ch.chapterNumber}章`;
          const content = ch.content || '';
          console.log(`[WorkDetailPage] Chapter ${ch.chapterNumber}: ${content.length} chars`);
          return `${title}\n\n${content}`;
        })
        .join('\n\n---\n\n');
      
      console.log(`[WorkDetailPage] Merged content length: ${mergedContent.length}`);
      setFullContent(mergedContent);
      setShowFullContent(true);
      console.log(`[WorkDetailPage] ✅ Loaded ${chapters.length} chapters, total ${mergedContent.length} chars`);
    } catch (error) {
      console.error('[WorkDetailPage] Load full content error:', error);
      setError('加载完整内容失败');
    } finally {
      setLoadingContent(false);
    }
  };

  // 保存章节
  const handleSaveChapter = async (updatedChapter: Chapter) => {
    if (!workId) return;

    try {
      const response = await fetch(`/api/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId, // 🔥 作品ID作为请求体参数
          chapter_number: updatedChapter.chapterNumber,
          title: updatedChapter.title,
          content: updatedChapter.content,
          word_count: updatedChapter.wordCount,
          status: updatedChapter.status,
          summary: updatedChapter.summary,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[WorkDetailPage] Save chapter error:', response.status, errorText);
        throw new Error(`Failed to save chapter: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.details || 'Unknown error');
      }

      // 更新本地状态
      setSelectedChapter(data.chapter);
      
      // 刷新作品信息
      if (workId) {
        await fetchWorkFromBackend(workId);
      }
    } catch (error) {
      console.error('[WorkDetailPage] Save chapter error:', error);
      throw error;
    }
  };

  // 🔥 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 🔥 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            加载失败
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              返回
            </button>
            <button
              onClick={() => workId && fetchWorkFromBackend(workId)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 作品不存在
  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <BookOpen className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            作品不存在
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            找不到ID为 {workId} 的作品
          </p>
          <button
            onClick={() => navigate('/works')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            返回作品列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>返回</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              作品详情
            </h1>
            
            <div className="w-20"></div> {/* 占位，保持标题居中 */}
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 左侧：作品总览 + 章节列表 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 作品总览 */}
            <WorkOverview work={work} />
            
            {/* 章节列表 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  章节列表
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {work.chapterCount} 章
                </span>
              </div>
              
              <ChapterList 
                workId={work.id}
                onChapterClick={setSelectedChapter}
              />
            </div>
          </div>

          {/* 右侧：章节内容预览（如果有选中的章节） */}
          <div className="lg:col-span-2">
            {showFullContent ? (
              /* 🔥 显示完整内容 */
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      完整内容
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {fullContent.length.toLocaleString()} 字
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFullContent(false)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    返回章节列表
                  </button>
                </div>
                
                <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {loadingContent ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">加载完整内容...</span>
                    </div>
                  ) : (
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                        {fullContent || <span className="text-gray-400 italic">暂无内容</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedChapter ? (
              /* 显示单个章节 */
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedChapter.title || `第${selectedChapter.chapterNumber}章`}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedChapter.wordCount?.toLocaleString()} 字
                  </p>
                </div>
                
                <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                      {selectedChapter.content || <span className="text-gray-400 italic">暂无内容</span>}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedChapter(selectedChapter)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    编辑章节
                  </button>
                </div>
              </div>
            ) : (
              /* 默认状态：提示选择章节或查看完整内容 */
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 p-12 text-center">
                <BookOpen className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  选择一个章节查看详情
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  点击左侧章节卡片查看完整内容
                </p>
                
                {/* 🔥 添加查看完整内容的按钮 */}
                <button
                  onClick={loadFullContent}
                  disabled={loadingContent}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingContent ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>加载中...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5" />
                      <span>查看完整内容</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 章节编辑器弹窗 */}
      {selectedChapter && (
        <ChapterEditor
          chapter={selectedChapter}
          onClose={() => setSelectedChapter(null)}
          onSave={handleSaveChapter}
        />
      )}
    </div>
  );
};

export default WorkDetailPage;