/**
 * 数据库服务层 —— 后端 API 版本
 * 实际数据库由 Node.js 后端服务提供，存储在移动硬盘 /Volumes/Seagate Exp/xm_db
 */

// 标记数据库是否已初始化完成（连接后端成功）
let initialized = false;

const API_BASE = 'http://localhost:3000';

export async function initDb(): Promise<void> {
  // 懒加载初始化：不再启动时全局请求
  // 各个页面在需要时自己会调用 API 加载数据
  initialized = true;
  console.log('ℹ️ 后端 API 懒加载模式，将在需要时连接');
}

export function isInitialized(): boolean {
  return initialized;
}

// ========== 作品 API ==========
export async function getWorks(page: number = 1, pageSize: number = 20): Promise<any> {
  const response = await fetch(`${API_BASE}/api/works/getList?page=${page}&pageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error(`获取作品列表失败: ${response.status}`);
  }
  return response.json();
}

export async function getWorkInfo(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/works/getInfo?id=${id}`);
  if (!response.ok) {
    throw new Error(`获取作品信息失败: ${response.status}`);
  }
  return response.json();
}

export async function getWorkFull(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/works/getFull?id=${id}`);
  if (!response.ok) {
    throw new Error(`获取作品完整信息失败: ${response.status}`);
  }
  return response.json();
}

export async function getWorksByStatus(status: string, page: number = 1, pageSize: number = 20): Promise<any> {
  const response = await fetch(`${API_BASE}/api/works/getByStatus?status=${status}&page=${page}&pageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error(`获取作品列表失败: ${response.status}`);
  }
  return response.json();
}

export async function getWorkChapters(id: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/works/getChapters?id=${id}`);
  if (!response.ok) {
    throw new Error(`获取章节列表失败: ${response.status}`);
  }
  return response.json();
}

export async function addWork(work: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/works/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(work),
  });
  return response.json();
}

export async function updateWork(id: string, updates: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/works/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  return response.json();
}

export async function deleteWork(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/works/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
}

// ========== 角色 API ==========
export async function getCharactersByWork(workId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/characters/getListByWork?workId=${workId}`);
  if (!response.ok) {
    throw new Error(`获取角色列表失败: ${response.status}`);
  }
  return response.json();
}

export async function getCharacterInfo(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/characters/getInfo?id=${id}`);
  if (!response.ok) {
    throw new Error(`获取角色信息失败: ${response.status}`);
  }
  return response.json();
}

export async function addCharacter(character: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/characters/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(character),
  });
  return response.json();
}

export async function updateCharacter(id: string, updates: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/characters/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  return response.json();
}

export async function deleteCharacter(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/characters/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
}

// ========== 分镜 API ==========
export async function getStoryboardsByWork(workId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/storyboards/getListByWork?workId=${workId}`);
  if (!response.ok) {
    throw new Error(`获取分镜列表失败: ${response.status}`);
  }
  return response.json();
}

export async function getStoryboardInfo(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/storyboards/getInfo?id=${id}`);
  if (!response.ok) {
    throw new Error(`获取分镜信息失败: ${response.status}`);
  }
  return response.json();
}

export async function addStoryboard(storyboard: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/storyboards/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(storyboard),
  });
  return response.json();
}

export async function deleteStoryboard(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/storyboards/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
}

// ========== 小说大纲 API ==========
export async function getOutlinesByWork(workId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/outlines/getListByWork?workId=${workId}`);
  if (!response.ok) {
    throw new Error(`获取大纲列表失败: ${response.status}`);
  }
  return response.json();
}

export async function getOutlineInfo(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/outlines/getInfo?id=${id}`);
  if (!response.ok) {
    throw new Error(`获取大纲信息失败: ${response.status}`);
  }
  return response.json();
}

export async function addOutline(outline: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/outlines/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outline),
  });
  return response.json();
}

export async function updateOutline(id: string, outline: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/outlines/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...outline }),
  });
  return response.json();
}

export async function deleteOutline(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/outlines/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
}

// ========== 生成历史 API ==========
export async function getHistory(page: number = 1, pageSize: number = 20): Promise<any> {
  const response = await fetch(`${API_BASE}/api/history/getList?page=${page}&pageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error(`获取历史列表失败: ${response.status}`);
  }
  return response.json();
}

export async function addHistory(item: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/history/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return response.json();
}

export async function deleteHistory(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/history/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
}

// ========== 流水线配置 API ==========
export async function getPipelineConfigList(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/config/pipeline/getList`);
  if (!response.ok) {
    throw new Error(`获取流水线配置失败: ${response.status}`);
  }
  return response.json();
}

export async function addPipelineConfig(config: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/pipeline/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return response.json();
}

export async function updatePipelineConfig(id: string, config: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/pipeline/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...config }),
  });
  return response.json();
}

export async function deletePipelineConfig(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/config/pipeline/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
}

// ========== 模型配置 API ==========
export async function getModels(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/config/models/getList`);
  if (!response.ok) {
    throw new Error(`获取模型列表失败: ${response.status}`);
  }
  return response.json();
}

export async function getModelInfo(id: number): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/models/getInfo?id=${id}`);
  if (!response.ok) {
    throw new Error(`获取模型信息失败: ${response.status}`);
  }
  return response.json();
}

export async function addModel(model: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/models/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model),
  });
  return response.json();
}

export async function updateModel(id: number, model: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/models/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...model }),
  });
  return response.json();
}

export async function deleteModel(id: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/config/models/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
}

// ========== 系统配置 API ==========
export async function getSystemConfig(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/system/getConfig`);
  if (!response.ok) {
    throw new Error(`获取系统配置失败: ${response.status}`);
  }
  return response.json();
}

export async function saveSystemConfig(config: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/system/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return response.json();
}

// ========== 应用配置 API ==========
export async function getAppConfig(key: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/app/getInfo?key=${key}`);
  if (!response.ok) {
    throw new Error(`获取应用配置失败: ${response.status}`);
  }
  return response.json();
}

export async function saveAppConfig(key: string, value: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/app/save?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  return response.json();
}

export const dbService = {
  isInitialized,
  // 作品
  getWorks,
  getWorkInfo,
  getWorkFull,
  getWorksByStatus,
  getWorkChapters,
  addWork,
  updateWork,
  deleteWork,
  // 角色
  getCharactersByWork,
  getCharacterInfo,
  addCharacter,
  updateCharacter,
  deleteCharacter,
  // 分镜
  getStoryboardsByWork,
  getStoryboardInfo,
  addStoryboard,
  deleteStoryboard,
  // 大纲
  getOutlinesByWork,
  getOutlineInfo,
  addOutline,
  updateOutline,
  deleteOutline,
  // 历史
  getHistory,
  addHistory,
  deleteHistory,
  // 流水线配置
  getPipelineConfigList,
  addPipelineConfig,
  updatePipelineConfig,
  deletePipelineConfig,
  // 模型配置
  getModels,
  getModelInfo,
  addModel,
  updateModel,
  deleteModel,
  // 系统配置
  getSystemConfig,
  saveSystemConfig,
  // 应用配置
  getAppConfig,
  saveAppConfig,
};
