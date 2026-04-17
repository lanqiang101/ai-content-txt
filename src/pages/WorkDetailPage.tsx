import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { WorkOverview } from '../components/WorkOverview';
import { ChapterList } from '../components/ChapterList';
import { Chapter } from '../types';
import { ArrowLeft, BookOpen, FileText, Eye, Sparkles, Plus } from 'lucide-react';
import { useChapterGeneration } from '../hooks/useChapterGeneration'; // 🔥 导入章节生成hook

export const WorkDetailPage: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { works } = useStore();
  const { generateChapter } = useChapterGeneration(); // 🔥 获取章节生成函数
  
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);
  const [fullContent, setFullContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]); // 🔥 存储章节列表
  const [isOptimizing, setIsOptimizing] = useState(false); // 🔥 AI优化状态
  const [isEditing, setIsEditing] = useState(false); // 🔥 编辑模式状态
  const [editingContent, setEditingContent] = useState(''); // 🔥 编辑中的内容
  const [isSaving, setIsSaving] = useState(false); // 🔥 保存状态
  const [isContinuingWriting, setIsContinuingWriting] = useState(false); // 🔥 续写状态

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

  // 🔥 加载章节列表并默认选中第一章
  useEffect(() => {
    const fetchChapters = async () => {
      if (!workId) return;
      
      try {
        console.log('[WorkDetailPage] Loading chapters for workId:', workId);
        const response = await fetch(`/api/chapters?workId=${workId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chapters');
        }
        
        const data = await response.json();
        const chaptersData = data.chapters || [];
        console.log(`[WorkDetailPage] Loaded ${chaptersData.length} chapters`);
        
        setChapters(chaptersData);
        
        // 🔥 默认选中第一章（如果有章节且当前未选中任何章节）
        if (chaptersData.length > 0 && !selectedChapter && !showFullContent) {
          console.log('[WorkDetailPage] Auto-selecting first chapter');
          setSelectedChapter(chaptersData[0]);
        }
      } catch (err) {
        console.error('[WorkDetailPage] Fetch chapters error:', err);
      }
    };

    fetchChapters();
  }, [workId]);

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
      setSelectedChapter(null); // 🔥 切换到完整视图时清除选中章节
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
      
      // 🔥 更新章节列表
      setChapters(prev => prev.map(ch => 
        ch.chapterNumber === data.chapter.chapterNumber ? data.chapter : ch
      ));
      
      // 刷新作品信息
      if (workId) {
        await fetchWorkFromBackend(workId);
      }
    } catch (error) {
      console.error('[WorkDetailPage] Save chapter error:', error);
      throw error;
    }
  };

  // 🔥 AI优化章节
  const handleOptimizeChapter = async () => {
    if (!selectedChapter || !selectedChapter.content) {
      alert('请先选择要优化的章节');
      return;
    }

    // 🔥 弹出输入框，让用户输入优化要求
    const optimizationRequest = prompt(
      '请输入优化要求（可选）：\n\n例如：\n- 增强场景描写\n- 优化对话自然度\n- 提升文笔流畅度\n- 增加情感表达\n\n留空则使用默认优化',
      ''
    );

    // 用户取消
    if (optimizationRequest === null) {
      return;
    }

    setIsOptimizing(true);
    try {
      console.log('[WorkDetailPage] Starting AI optimization for chapter:', selectedChapter.chapterNumber);
      
      // 调用后端API进行优化
      const response = await fetch('/api/chapters/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId,
          chapterNumber: selectedChapter.chapterNumber,
          content: selectedChapter.content,
          optimizationRequest: optimizationRequest.trim(), // 🔥 传递用户的优化要求
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI优化失败');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '优化失败');
      }

      // 更新选中的章节内容
      const optimizedChapter = {
        ...selectedChapter,
        content: data.optimizedContent,
        wordCount: data.optimizedContent.length,
        updatedAt: Date.now(),
      };
      
      setSelectedChapter(optimizedChapter);
      
      // 更新章节列表
      setChapters(prev => prev.map(ch => 
        ch.chapterNumber === optimizedChapter.chapterNumber ? optimizedChapter : ch
      ));

      alert('✅ AI优化完成！');
    } catch (error: unknown) {
      console.error('[WorkDetailPage] AI optimization error:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`AI优化失败：${errorMessage}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  // 🔥 处理章节点击 - 切换显示而不是打开弹窗
  const handleChapterClick = (chapter: Chapter) => {
    console.log('[WorkDetailPage] Chapter clicked:', chapter.chapterNumber);
    setSelectedChapter(chapter);
    setShowFullContent(false); // 🔥 切换到章节视图时关闭完整视图
    setIsEditing(false); // 🔥 切换章节时退出编辑模式
  };

  // 🔥 保存编辑内容
  const handleSaveEdit = async () => {
    if (!selectedChapter || !editingContent.trim()) {
      alert('内容不能为空');
      return;
    }

    setIsSaving(true);
    try {
      const updatedChapter = {
        ...selectedChapter,
        content: editingContent,
        wordCount: editingContent.length,
        updatedAt: Date.now(),
      };

      await handleSaveChapter(updatedChapter);
      
      setIsEditing(false);
      setSelectedChapter(updatedChapter);
      
      // 更新章节列表
      setChapters(prev => prev.map(ch => 
        ch.chapterNumber === updatedChapter.chapterNumber ? updatedChapter : ch
      ));

      alert('✅ 保存成功！');
    } catch (error) {
      console.error('[WorkDetailPage] Save edit error:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 🔥 续写下一章
  const handleContinueWriting = async () => {
    if (!workId || !work) {
      alert('作品信息不存在');
      return;
    }

    if (!confirm('确定要续写下一章吗？这将基于已有内容生成新的章节。')) {
      return;
    }

    setIsContinuingWriting(true);
    try {
      // 计算下一章的章节号
      const maxChapterNumber = chapters.length > 0 
        ? Math.max(...chapters.map(ch => ch.chapterNumber))
        : 0;
      const nextChapterNumber = maxChapterNumber + 1;
      
      console.log(`[WorkDetailPage] 📝 开始续写第${nextChapterNumber}章...`);
      
      // 获取作品的生成参数
      const generationParams = work.generationParams;
      if (!generationParams) {
        throw new Error('作品缺少生成参数');
      }
      
      // 计算目标字数（平均每章）
      const targetWordCount = Math.floor(generationParams.wordCount / (generationParams.initialChapters || 10));
      
      // 创建章节大纲（简化版）
      const chapterOutline = {
        chapterNumber: nextChapterNumber,
        title: `第${nextChapterNumber}章`,
        summary: '基于前文内容继续发展',
        targetWordCount,
        status: 'generating' as const,
      };
      
      // 调用章节生成函数
      const newChapter = await generateChapter(
        workId,
        chapterOutline,
        generationParams,
        new AbortController().signal,
        undefined
      );
      
      if (newChapter) {
        console.log(`[WorkDetailPage] ✅ 第${nextChapterNumber}章生成成功`);
        
        // 刷新章节列表
        const response = await fetch(`/api/chapters?workId=${workId}`);
        if (response.ok) {
          const data = await response.json();
          setChapters(data.chapters || []);
          
          // 自动选中新生成的章节
          const latestChapter = data.chapters?.find((ch: Chapter) => ch.chapterNumber === nextChapterNumber);
          if (latestChapter) {
            setSelectedChapter(latestChapter);
          }
        }
        
        alert(`✅ 第${nextChapterNumber}章续写成功！`);
      } else {
        throw new Error('章节生成失败');
      }
    } catch (error) {
      console.error('[WorkDetailPage] Continue writing error:', error);
      alert(`续写失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsContinuingWriting(false);
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
                onChapterClick={handleChapterClick} // 🔥 使用新的点击处理函数
                selectedChapterId={selectedChapter?.id} // 🔥 传递选中状态
              />
              
              {/* 🔥 续写下一章按钮 - 移到ChapterList外部 */}
              <button
                onClick={handleContinueWriting}
                disabled={isContinuingWriting}
                className="w-full mt-4 p-4 border-2 border-dashed border-primary/50 hover:border-primary rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  {isContinuingWriting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span className="font-medium">续写中...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">续写下一章</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  基于已有内容继续生成新章节
                </p>
              </button>
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
                    onClick={() => {
                      setShowFullContent(false);
                      // 🔥 恢复选中第一章
                      if (chapters.length > 0) {
                        setSelectedChapter(chapters[0]);
                      }
                    }}
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
              /* 显示单个章节 - 支持查看和编辑模式 */
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedChapter.title || `第${selectedChapter.chapterNumber}章`}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {selectedChapter.wordCount?.toLocaleString()} 字
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {/* 🔥 AI优化按钮 */}
                      <button
                        onClick={handleOptimizeChapter}
                        disabled={isOptimizing || !selectedChapter.content}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="使用AI优化本章内容"
                      >
                        {isOptimizing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>优化中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>AI优化</span>
                          </>
                        )}
                      </button>
                      
                      {/* 🔥 保存按钮（仅在编辑模式下显示） */}
                      {isEditing && (
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? '保存中...' : '保存'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {isEditing ? (
                    /* 编辑模式 */
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full h-full min-h-[400px] resize-none bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-gray-100 leading-relaxed text-base"
                      style={{ fontFamily: "'Noto Serif SC', serif" }}
                      placeholder="在此编辑章节内容..."
                    />
                  ) : (
                    /* 查看模式 */
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                        {selectedChapter.content || <span className="text-gray-400 italic">暂无内容</span>}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-2">
                  {isEditing ? (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingContent(selectedChapter.content || '');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      取消编辑
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditingContent(selectedChapter.content || '');
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      编辑章节
                    </button>
                  )}
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

    </div>
  );
};

export default WorkDetailPage;