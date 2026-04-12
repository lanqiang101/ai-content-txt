/**
 * 分镜服务 —— 后端 API 版本
 */

import { StoryboardResult } from '../types';
import {
  getStoryboardsByWorkIdAPI,
  getStoryboardByIdAPI,
  createStoryboardAPI,
  deleteStoryboardAPI,
  getAllStoryboardsAPI,
} from './api';

// 获取作品的所有分镜
export async function getAllStoryboardsByWorkId(workId: string): Promise<StoryboardResult[]> {
  return getStoryboardsByWorkIdAPI(workId);
}

// 获取所有分镜
export async function getAllStoryboards(): Promise<StoryboardResult[]> {
  return getAllStoryboardsAPI();
}

// 根据ID获取分镜
export async function getStoryboardById(id: string): Promise<StoryboardResult | null> {
  return getStoryboardByIdAPI(id);
}

// 创建分镜
export async function createStoryboard(storyboard: StoryboardResult): Promise<StoryboardResult> {
  return createStoryboardAPI(storyboard);
}

// 删除分镜
export async function deleteStoryboard(id: string): Promise<boolean> {
  const response = await deleteStoryboardAPI(id);
  return response.success;
}
