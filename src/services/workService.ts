/**
 * 作品服务 —— 后端 API 版本
 */

import { Work, WorkFull, Chapter } from '../types';
import {
  getAllWorksAPI,
  getWorkByIdAPI,
  getWorkFullByIdAPI,
  createWorkAPI,
  updateWorkAPI,
  deleteWorkAPI,
  getWorksByStatusAPI,
  getChaptersByWorkIdAPI,
} from './api';

// 获取所有作品（分页）
export async function getAllWorks(page: number = 1, pageSize: number = 20) {
  const response = await getAllWorksAPI(page, pageSize);
  return {
    works: response.works,
    total: response.total,
    page: response.page,
    pageSize: response.pageSize,
  };
}

// 根据ID获取作品
export async function getWorkById(id: string): Promise<Work | null> {
  return getWorkByIdAPI(id);
}

// 获取完整作品（包含章节）
export async function getWorkFullById(id: string): Promise<WorkFull | null> {
  return getWorkFullByIdAPI(id);
}

// 创建作品
export async function createWork(work: Work): Promise<Work> {
  return createWorkAPI(work);
}

// 更新作品
export async function updateWork(id: string, updates: Partial<Work>): Promise<Work | null> {
  return updateWorkAPI(id, updates);
}

// 删除作品（软删除）
export async function deleteWork(id: string): Promise<boolean> {
  const response = await deleteWorkAPI(id);
  return response.success;
}

// 根据状态筛选作品
export async function getWorksByStatus(
  status: Work['status'],
  page: number = 1,
  pageSize: number = 20
) {
  const response = await getWorksByStatusAPI(status, page, pageSize);
  return {
    works: response.works,
    total: response.total,
    page: response.page,
    pageSize: response.pageSize,
  };
}

// 获取作品的章节列表
export async function getChaptersByWorkId(workId: string): Promise<Chapter[]> {
  return getChaptersByWorkIdAPI(workId);
}

// 创建章节（章节在作品更新时一起处理）
export async function createChapter(chapter: Chapter): Promise<Chapter> {
  // 保持接口兼容性，实际业务代码通过更新作品处理章节
  return chapter;
}

// 更新章节
export async function updateChapter(
  workId: string,
  chapterId: string,
  updates: Partial<Chapter>
): Promise<Chapter | null> {
  // 保持接口兼容性
  return { ...updates, id: chapterId, workId } as Chapter;
}

// 删除章节
export async function deleteChapter(workId: string, chapterId: string): Promise<boolean> {
  // 保持接口兼容性
  return true;
}
