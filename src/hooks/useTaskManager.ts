import { useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';

/**
 * 后台任务管理Hook
 * 负责任务队列、通知、断点续传等功能
 */
export const useTaskManager = () => {
  const { generation, setGeneration, currentWorkId } = useStore();

  // 🔥 请求浏览器通知权限
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('[TaskManager] Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // 🔥 发送浏览器通知
  const sendNotification = useCallback((title: string, body: string, workId?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: workId, // 相同workId的通知会替换
        requireInteraction: false,
      });

      // 点击通知时跳转到作品详情
      if (workId) {
        notification.onclick = () => {
          window.focus();
          window.location.href = `/works/${workId}`;
          notification.close();
        };
      }

      // 5秒后自动关闭
      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  // 🔥 保存任务进度到localStorage（断点续传）
  const saveTaskProgress = useCallback(() => {
    if (generation.isGenerating && currentWorkId) {
      const progress = {
        workId: currentWorkId,
        currentStage: generation.currentStage,
        currentCycle: generation.currentCycle,
        completedCycles: generation.completedCycles,
        stage1Result: generation.stage1Result,
        stage2Result: generation.stage2Result,
        stage3Result: generation.stage3Result,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('ai-content-task-progress', JSON.stringify(progress));
      console.log('[TaskManager] Progress saved:', progress);
    }
  }, [generation, currentWorkId]);

  // 🔥 恢复任务进度
  const restoreTaskProgress = useCallback(() => {
    const saved = localStorage.getItem('ai-content-task-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        const age = Date.now() - progress.timestamp;
        
        // 如果任务在24小时内，提示用户恢复
        if (age < 24 * 60 * 60 * 1000) {
          console.log('[TaskManager] Found unfinished task:', progress);
          return progress;
        } else {
          // 超过24小时，清除旧数据
          localStorage.removeItem('ai-content-task-progress');
        }
      } catch (error) {
        console.error('[TaskManager] Failed to restore progress:', error);
        localStorage.removeItem('ai-content-task-progress');
      }
    }
    return null;
  }, []);

  // 🔥 清除任务进度
  const clearTaskProgress = useCallback(() => {
    localStorage.removeItem('ai-content-task-progress');
    console.log('[TaskManager] Progress cleared');
  }, []);

  // 🔥 定期保存进度（每30秒）
  useEffect(() => {
    if (!generation.isGenerating) return;

    const interval = setInterval(saveTaskProgress, 30000);
    return () => clearInterval(interval);
  }, [generation.isGenerating, saveTaskProgress]);

  // 🔥 关键节点立即保存（Stage切换时）
  useEffect(() => {
    if (generation.isGenerating && generation.currentStage > 0) {
      saveTaskProgress();
    }
  }, [generation.currentStage, generation.isGenerating, saveTaskProgress]);

  // 🔥 任务完成时发送通知
  useEffect(() => {
    if (!generation.isGenerating && currentWorkId && generation.completedCycles > 0) {
      const { works } = useStore.getState();
      const work = works.find(w => w.id === currentWorkId);
      
      if (work) {
        sendNotification(
          '✅ 作品生成完成',
          `${work.title}: ${work.actualWordCount.toLocaleString()}字`,
          currentWorkId
        );
      }
      
      // 清除进度记录
      clearTaskProgress();
    }
  }, [generation.isGenerating, generation.completedCycles, currentWorkId, sendNotification, clearTaskProgress]);

  return {
    requestNotificationPermission,
    sendNotification,
    saveTaskProgress,
    restoreTaskProgress,
    clearTaskProgress,
  };
};
