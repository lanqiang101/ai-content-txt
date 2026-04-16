import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  ChevronLeft,
  Loader2,
  Settings as SettingsIcon,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/Button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/Tabs";
import { Label } from "../components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Card, CardContent } from "../components/ui/Card";
import { dbService } from "../services/db";
import type { ModelConfig } from "../types";

interface SystemConfigData {
  stage1: number | null;
  stage2: number | null;
  stage3: number | null;
  random: number | null;
  storyboard: number | null;
  chapterContinuation: number | null; // 章节续写
  chapterOptimization: number | null; // 章节优化
  popularTopics: number | null; // 热门主题推荐
}

const stageDefinitions = [
  {
    key: "stage1",
    label: "阶段1",
    fullLabel: "阶段1 - 骨架搭建",
    description: "创建小说整体骨架，设定世界观、人物、故事大纲",
  },
  { 
    key: "stage2", 
    label: "阶段2",
    fullLabel: "阶段2 - 血肉填充",
    description: "逐章生成正文内容" 
  },
  {
    key: "stage3",
    label: "阶段3",
    fullLabel: "阶段3 - 去AI打磨",
    description: "润色去AI化，让文风更自然",
  },
  { 
    key: "random", 
    label: "随机候选词",
    fullLabel: "随机候选词",
    description: "生成章节关键词随机候选" 
  },
  {
    key: "storyboard",
    label: "分镜生成",
    fullLabel: "分镜生成",
    description: "生成视频、漫画分镜脚本",
  },
  {
    key: "chapterContinuation",
    label: "章节续写",
    fullLabel: "章节续写",
    description: "用于作品详情页的章节续写功能，建议选择擅长长文本生成的模型",
  },
  {
    key: "chapterOptimization",
    label: "章节优化",
    fullLabel: "章节AI优化",
    description: "用于章节内容的AI优化和润色，建议选择擅长文本优化的模型",
  },
  {
    key: "popularTopics",
    label: "热门主题",
    fullLabel: "热门主题推荐",
    description: "用于生成热门主题推荐内容，建议选择创意性强的模型",
  },
] as const;

export const ConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadConfigFromDB } = useStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>([]);
  const [activeTab, setActiveTab] = useState("stage1");
  const [config, setLocalConfig] = useState<SystemConfigData>({
    stage1: null,
    stage2: null,
    stage3: null,
    random: null,
    storyboard: null,
    chapterContinuation: null,
    chapterOptimization: null,
    popularTopics: null,
  });

  // 页面加载时从后端加载
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // 加载所有启用的模型
        const models = await dbService.getModels();
        setAvailableModels(models.filter((m) => m.enabled));
        console.log("✅ 加载了", models.length, "个启用的模型");

        // 加载已保存的系统配置
        const systemConfig = await dbService.getSystemConfig();
        if (systemConfig) {
          console.log("✅ 加载了系统配置", systemConfig);
          setLocalConfig({
            stage1: systemConfig.stage1 || null,
            stage2: systemConfig.stage2 || null,
            stage3: systemConfig.stage3 || null,
            random: systemConfig.random || null,
            storyboard: systemConfig.storyboard || null,
            chapterContinuation: systemConfig.chapterContinuation || null,
            chapterOptimization: systemConfig.chapterOptimization || null,
            popularTopics: systemConfig.popularTopics || null,
          });
        }
      } catch (err) {
        setError((err as Error).message);
        console.error("❌ 加载失败:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  console.log(config, "config", stageDefinitions);

  // 保存配置到后端
  const saveConfig = async () => {
    try {
      setSaving(true);
      await dbService.saveSystemConfig(config);
      console.log("✅ 系统配置已保存到数据库");
      
      // 🔥 关键修复：保存后立即从数据库重新加载配置到 Zustand store
      await loadConfigFromDB();
      console.log("✅ 已从数据库刷新配置到前端状态");
      
      alert("配置已保存成功！");
    } catch (err) {
      setError((err as Error).message);
      console.error("❌ 保存失败:", err);
      alert("保存失败: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // 更新当前配置中某个阶段的模型ID
  const updateStageModel = (
    stageKey: keyof SystemConfigData,
    modelId: number | null,
  ) => {
    setLocalConfig((prev) => ({
      ...prev,
      [stageKey]: modelId,
    }));
  };

  // 根据ID获取模型信息
  const getModelById = (id: number | null | undefined) => {
    if (!id) return null;
    return availableModels.find((m) => String(m.id) === String(id));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <Settings size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              系统配置
            </h1>
            <p className="text-sm text-gray-500">
              配置各生成阶段使用的模型（模型在模型管理页面管理）
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/models")}>
            <SettingsIcon size={16} className="mr-1" />
            模型管理
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            <ChevronLeft size={16} />
            返回创作
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-500 mr-2" />
          <span className="text-gray-500">从数据库加载配置...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-300">加载失败: {error}</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            请确保后端服务已启动: cd server && node index.js
          </p>
        </div>
      )}

      {!loading && availableModels.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            当前没有任何启用的模型，请先前往 <strong>模型管理</strong>{" "}
            页面添加模型。
          </p>
        </div>
      )}

      {/* Tab 布局 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 border-b border-gray-200 dark:border-slate-700">
            {stageDefinitions.map((stage) => (
              <TabsTrigger key={stage.key} value={stage.key}>
                {stage.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {stageDefinitions.map((stage) => (
            <TabsContent key={stage.key} value={stage.key} className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    {stage.fullLabel}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stage.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>选择模型</Label>
                  <Select
                    value={
                      config[stage.key as keyof SystemConfigData] != null
                        ? config[
                            stage.key as keyof SystemConfigData
                          ]!.toString()
                        : undefined
                    }
                    onValueChange={(value) =>
                      updateStageModel(
                        stage.key as keyof SystemConfigData,
                        value === "null" ? null : parseInt(value),
                      )
                    }
                  >
                    <SelectTrigger>
                      {config[stage.key as keyof SystemConfigData] != null ? (
                        <SelectValue>
                          {getModelById(
                            config[stage.key as keyof SystemConfigData],
                          )
                            ? `${getModelById(config[stage.key as keyof SystemConfigData])!.name} (${getModelById(config[stage.key as keyof SystemConfigData])!.modelName})`
                            : config[
                                stage.key as keyof SystemConfigData
                              ]!.toString()}
                        </SelectValue>
                      ) : (
                        <SelectValue placeholder="请选择一个模型" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">(不选择)</SelectItem>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id!.toString()}>
                          {model.name} ({model.modelName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getModelById(config[stage.key as keyof SystemConfigData]) && (
                  <Card>
                    <CardContent className="pt-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          模型名称
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {
                            getModelById(
                              config[stage.key as keyof SystemConfigData],
                            )?.name
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          模型标识
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {
                            getModelById(
                              config[stage.key as keyof SystemConfigData],
                            )?.modelName
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          API 地址
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                          {
                            getModelById(
                              config[stage.key as keyof SystemConfigData],
                            )?.baseUrl
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          温度
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {
                            getModelById(
                              config[stage.key as keyof SystemConfigData],
                            )?.temperature
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          最大 Tokens
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {
                            getModelById(
                              config[stage.key as keyof SystemConfigData],
                            )?.maxTokens
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* 保存按钮 */}
      <div className="mt-6 flex justify-end">
        <Button
          variant="primary"
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-8"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "保存中..." : "保存配置"}
        </Button>
      </div>

      {/* 使用提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          ⚙️ 配置说明
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 每个生成阶段选择一个已添加的模型</li>
          <li>
            • 模型列表只显示<strong>已启用</strong>的模型
          </li>
          <li>• 修改后点击"保存配置"才会写入数据库</li>
          <li>• 添加/编辑/删除模型请到"模型管理"页面</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfigPage;
