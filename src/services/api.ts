/**
 * API 客户端
 * 调用后端 Node.js 服务，数据库实际存储在移动硬盘 /Volumes/Seagate Exp/xm_db
 */

import type {
  Work,
  WorkFull,
  Chapter,
  Character,
  WorkStatus,
  StoryboardResult,
  BookOutline,
  ContentHistory,
} from '../types';

const API_BASE = 'http://localhost:3000/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ========== 作品 API ==========

export async function getAllWorksAPI(page: number = 1, pageSize: number = 20) {
  return request<{
    works: Work[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/works?page=${page}&pageSize=${pageSize}`);
}

export async function getWorkByIdAPI(id: string) {
  return request<Work | null>(`/works/${id}`);
}

export async function getWorkFullByIdAPI(id: string) {
  return request<WorkFull | null>(`/works/${id}/full`);
}

export async function createWorkAPI(work: Work) {
  return request<Work>('/works', {
    method: 'POST',
    body: JSON.stringify(work),
  });
}

export async function updateWorkAPI(id: string, updates: Partial<Work>) {
  return request<Work | null>(`/works/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteWorkAPI(id: string) {
  return request<{ success: boolean }>(`/works/${id}`, {
    method: 'DELETE',
  });
}

export async function getWorksByStatusAPI(status: WorkStatus, page: number = 1, pageSize: number = 20) {
  return request<{
    works: Work[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/works/status/${status}?page=${page}&pageSize=${pageSize}`);
}

export async function getChaptersByWorkIdAPI(workId: string) {
  return request<Chapter[]>(`/works/${workId}/chapters`);
}

// ========== 角色 API ==========

export async function getCharactersByWorkIdAPI(workId: string) {
  return request<Character[]>(`/characters/work/${workId}`);
}

export async function getCharacterByIdAPI(id: string) {
  return request<Character | null>(`/characters/${id}`);
}

export async function createCharacterAPI(character: Character) {
  return request<Character>('/characters', {
    method: 'POST',
    body: JSON.stringify(character),
  });
}

export async function updateCharacterAPI(id: string, updates: Partial<Character>) {
  return request<Character | null>(`/characters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteCharacterAPI(id: string) {
  return request<{ success: boolean }>(`/characters/${id}`, {
    method: 'DELETE',
  });
}

// ========== 分镜 API ==========

export async function getStoryboardsByWorkIdAPI(workId: string) {
  return request<StoryboardResult[]>(`/storyboards/work/${workId}`);
}

export async function getStoryboardByIdAPI(id: string) {
  return request<StoryboardResult | null>(`/storyboards/${id}`);
}

export async function createStoryboardAPI(storyboard: StoryboardResult) {
  return request<StoryboardResult>('/storyboards', {
    method: 'POST',
    body: JSON.stringify(storyboard),
  });
}

export async function deleteStoryboardAPI(id: string) {
  return request<{ success: boolean }>(`/storyboards/${id}`, {
    method: 'DELETE',
  });
}

export async function getAllStoryboardsAPI() {
  return request<StoryboardResult[]>('/storyboards');
}

// ========== 小说大纲 API ==========

export async function getBookOutlineByWorkIdAPI(workId: string) {
  return request<BookOutline | null>(`/outlines/work/${workId}`);
}

export async function getAllBookOutlinesByWorkIdAPI(workId: string) {
  return request<BookOutline[]>(`/outlines/work/${workId}`);
}

export async function saveBookOutlineAPI(outline: BookOutline) {
  return request<BookOutline>('/outlines', {
    method: 'POST',
    body: JSON.stringify(outline),
  });
}

export async function updateBookOutlineAPI(outline: BookOutline) {
  return request<BookOutline>(`/outlines/${outline.id}`, {
    method: 'PUT',
    body: JSON.stringify(outline),
  });
}

export async function deleteBookOutlineAPI(id: string) {
  return request<{ success: boolean }>(`/outlines/${id}`, {
    method: 'DELETE',
  });
}

// ========== 生成历史 API ==========

export async function getAllHistoryAPI(page: number = 1, pageSize: number = 20) {
  return request<{
    history: ContentHistory[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/history?page=${page}&pageSize=${pageSize}`);
}

export async function createHistoryAPI(item: ContentHistory) {
  return request<ContentHistory>('/history', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function deleteHistoryAPI(id: string) {
  return request<{ success: boolean }>(`/history/${id}`, {
    method: 'DELETE',
  });
}

// ========== 配置 API ==========

export async function getPipelineConfigsAPI() {
  return request<any[]>('/config/pipeline');
}

export async function createPipelineConfigAPI(config: any) {
  return request<any>('/config/pipeline', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function updatePipelineConfigAPI(id: string, config: any) {
  return request<any>(`/config/pipeline/${id}`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function deletePipelineConfigAPI(id: string) {
  return request<{ success: boolean }>(`/config/pipeline/${id}`, {
    method: 'DELETE',
  });
}

export async function getModelConfigsAPI() {
  return request<any[]>('/config/models');
}

export async function getAppConfigAPI<T>(key: string) {
  return request<T | null>(`/config/app/${key}`);
}

export async function setAppConfigAPI<T>(key: string, value: T) {
  return request<T>(`/config/app/${key}`, {
    method: 'POST',
    body: JSON.stringify(value),
  });
}

export default {
  getAllWorksAPI,
  getWorkByIdAPI,
  getWorkFullByIdAPI,
  createWorkAPI,
  updateWorkAPI,
  deleteWorkAPI,
  getWorksByStatusAPI,
  getChaptersByWorkIdAPI,
  getCharactersByWorkIdAPI,
  getCharacterByIdAPI,
  createCharacterAPI,
  updateCharacterAPI,
  deleteCharacterAPI,
  getStoryboardsByWorkIdAPI,
  getStoryboardByIdAPI,
  createStoryboardAPI,
  deleteStoryboardAPI,
  getAllStoryboardsAPI,
  getBookOutlineByWorkIdAPI,
  getAllBookOutlinesByWorkIdAPI,
  saveBookOutlineAPI,
  updateBookOutlineAPI,
  deleteBookOutlineAPI,
  getAllHistoryAPI,
  createHistoryAPI,
  deleteHistoryAPI,
  getPipelineConfigsAPI,
  createPipelineConfigAPI,
  updatePipelineConfigAPI,
  deletePipelineConfigAPI,
  getModelConfigsAPI,
  getAppConfigAPI,
  setAppConfigAPI,
};
