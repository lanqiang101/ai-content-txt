/**
 * 小说大纲服务 —— 后端 API 版本
 */

import { BookOutline } from '../types';
import {
  getAllBookOutlinesByWorkIdAPI,
  saveBookOutlineAPI,
  updateBookOutlineAPI,
  deleteBookOutlineAPI,
} from './api';

// 获取作品的所有小说大纲
export async function getAllByWorkId(workId: string): Promise<BookOutline[]> {
  return getAllBookOutlinesByWorkIdAPI(workId);
}

// 保存大纲
export async function saveOutline(outline: BookOutline): Promise<BookOutline> {
  return saveBookOutlineAPI(outline);
}

// 更新大纲
export async function updateOutline(outline: BookOutline): Promise<BookOutline> {
  return updateBookOutlineAPI(outline);
}

// 删除大纲
export async function deleteOutline(id: string): Promise<boolean> {
  const response = await deleteBookOutlineAPI(id);
  return response.success;
}
