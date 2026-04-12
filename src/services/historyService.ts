/**
 * 生成历史服务 —— 后端 API 版本
 */

import { ContentHistory } from '../types';
import {
  getAllHistoryAPI,
  createHistoryAPI,
  deleteHistoryAPI,
} from './api';

// 获取所有历史记录（分页）
export async function getAllHistoryList(page: number = 1, pageSize: number = 20) {
  const response = await getAllHistoryAPI(page, pageSize);
  return {
    history: response.history,
    total: response.total,
    page: response.page,
    pageSize: response.pageSize,
  };
}

// 创建历史记录
export async function createHistory(item: ContentHistory): Promise<ContentHistory> {
  return createHistoryAPI(item);
}

// 删除历史记录
export async function deleteHistory(id: string): Promise<boolean> {
  const response = await deleteHistoryAPI(id);
  return response.success;
}
