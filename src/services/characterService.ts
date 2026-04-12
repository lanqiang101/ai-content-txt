/**
 * 角色服务 —— 后端 API 版本
 */

import { Character } from '../types';
import {
  getCharactersByWorkIdAPI,
  getCharacterByIdAPI,
  createCharacterAPI,
  updateCharacterAPI,
  deleteCharacterAPI,
} from './api';

// 获取作品的所有角色
export async function getAllCharactersByWorkId(workId: string): Promise<Character[]> {
  return getCharactersByWorkIdAPI(workId);
}

// 获取所有角色（简化返回）
export async function getAllCharacters(): Promise<Character[]> {
  // 保持接口兼容性，实际按作品筛选
  return [];
}

// 根据ID获取角色
export async function getCharacterById(id: string): Promise<Character | null> {
  return getCharacterByIdAPI(id);
}

// 创建角色
export async function createCharacter(character: Character): Promise<Character> {
  return createCharacterAPI(character);
}

// 更新角色
export async function updateCharacter(id: string, updates: Partial<Character>): Promise<Character | null> {
  return updateCharacterAPI(id, updates);
}

// 删除角色
export async function deleteCharacter(id: string): Promise<boolean> {
  const response = await deleteCharacterAPI(id);
  return response.success;
}
