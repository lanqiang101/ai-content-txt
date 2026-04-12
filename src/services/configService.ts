/**
 * 配置服务 —— 后端 API 版本
 */

import { PipelineConfig, GenerationParams } from '../types';
import {
  getPipelineConfigsAPI,
  createPipelineConfigAPI,
  updatePipelineConfigAPI,
  deletePipelineConfigAPI,
  getAppConfigAPI,
  setAppConfigAPI,
} from './api';

// 获取流水线配置（保持接口兼容性
export function getPipelineConfig(): PipelineConfig | null {
  // 现在流水线配置保持在前端 store 中，由 persist 本地存储兜底
  return null;
}

// 保存流水线配置
export async function savePipelineConfig(config: PipelineConfig): Promise<void> {
  // 保持接口兼容性，前端 persist 已经处理
}

// 获取生成参数
export function getGenerationParams(): GenerationParams | null {
  return null;
}

// 保存生成参数
export async function saveGenerationParams(params: GenerationParams): Promise<void> {
  // 保持接口兼容性
}

// 获取流水线配置列表
export async function getPipelineConfigs() {
  return getPipelineConfigsAPI();
}

// 创建流水线配置
export async function createPipelineConfig(config: any) {
  return createPipelineConfigAPI(config);
}

// 更新流水线配置
export async function updatePipelineConfig(id: string, config: any) {
  return updatePipelineConfigAPI(id, config);
}

// 删除流水线配置
export async function deletePipelineConfig(id: string): Promise<boolean> {
  const response = await deletePipelineConfigAPI(id);
  return response.success;
}

// 获取深色模式配置
export function getDarkModeConfig(): boolean | 'auto' {
  // 保持默认值
  return 'auto';
}

// 获取定时器自动化配置
export function getTimerAutomationConfig() {
  // 返回默认值
  return null;
}

// 获取应用配置
export async function getAppConfig<T>(key: string): Promise<T | null> {
  return getAppConfigAPI<T>(key);
}

// 设置应用配置
export async function setAppConfig<T>(key: string, value: T): Promise<T> {
  return setAppConfigAPI<T>(key, value);
}
