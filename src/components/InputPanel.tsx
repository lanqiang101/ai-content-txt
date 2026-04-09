import React from "react";
import { useStore } from "../store/useStore";
import { RefreshCw, Search } from "lucide-react";
import {
  RandomButton,
  RandomSliderButton,
  RandomSelectButton,
  RandomInspireButton,
} from "./RandomButton";
import { KeywordGeneratorButton } from "./KeywordGeneratorButton";
import { HotTopicSearch } from "./HotTopicSearch";

export const InputPanel: React.FC = () => {
  const { params, setParams, resetGeneration } = useStore();

  const handleReset = () => {
    resetGeneration();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg card-gradient p-4 sm:p-5 transition-all hover:shadow-xl border border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          创作参数
        </h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
        >
          <RefreshCw size={14} />
          重置
        </button>
      </div>

      <div className="space-y-5">
        {/* 基础参数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            内容类型
          </label>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                params.type === "article"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
              onClick={() => setParams({ type: "article" })}
            >
              公众号文章
            </button>
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                params.type === "novel"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
              onClick={() => setParams({ type: "novel" })}
            >
              小说
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              主题
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={params.topic}
              onChange={(e) => setParams({ topic: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="请输入小说主题..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <RandomInspireButton
                fieldDescription="热门网络小说主题"
                rules="生成当前热门的小说主题，要求具体不笼统"
                currentValue={params.topic}
                count={10}
                onSelect={(value) => setParams({ topic: value })}
              />
            </div>
          </div>
          <div className="mt-2">
            <HotTopicSearch
              onSelectTopic={(topic) => setParams({ topic })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              小说标题
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={params.title}
              onChange={(e) => setParams({ title: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="吸引人的小说标题..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <RandomInspireButton
                fieldDescription={`根据当前主题生成吸引人的小说标题，当前小说主题是：${params.topic}`}
                rules={`生成符合番茄小说平台爆款规范的标题，要求标题必须紧扣主题【${params.topic}】，必须包含和主题相关的元素，要求标题吸引人、符合当下热点、有钩子、能让读者有点击欲望，不要太长，生成10个`}
                currentValue={params.title}
                count={10}
                onSelect={(value) => setParams({ title: value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              关键词（用逗号分隔）
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={params.keywords}
              onChange={(e) => setParams({ keywords: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="AI, 未来科技, 都市异能..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <KeywordGeneratorButton
                topic={params.topic}
                title={params.title}
                currentKeywords={params.keywords}
                onSelect={(keywords) => setParams({ keywords })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              期望字数（字）短篇小说最长100000
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              min={100}
              max={100000}
              value={params.wordCount}
              onChange={(e) =>
                setParams({ wordCount: parseInt(e.target.value) })
              }
              className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="期望生成多少字..."
            />
            {/* <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="根据小说常见篇幅随机生成期望字数，要符合平台常规"
                rules="只返回一个数字，不要单位"
                count={1}
                onSelect={(value) => {
                  const num = parseInt(value.replace(/\D/g, ""));
                  if (!isNaN(num)) setParams({ wordCount: num });
                }}
              />
            </div> */}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              整体文风
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={params.style}
              onChange={(e) => setParams({ style: e.target.value })}
              className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="轻松幽默，都市豪门..."
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="整体文章文风形容词"
                rules="生成10种不同文风，每种1-3个词"
                count={10}
                onSelect={(value) => setParams({ style: value })}
              />
            </div>
          </div>
        </div>

        {/* ========== 七大参数分组 - 只在小说类型显示 ========== */}
        {params.type === "novel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* 1. 读者定位 */}
            <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
              <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
                <span className="group-open:underline">🔍 读者定位</span>
              </summary>
              <div className="grid grid-cols-1 gap-y-3 mt-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      读者年龄层
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.reader.ageRange}
                      onChange={(e) =>
                        setParams({
                          reader: {
                            ...params.reader,
                            ageRange: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="18-25岁"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="常见网络小说读者年龄范围"
                        rules="常见年龄范围，比如 18-25岁"
                        count={10}
                        onSelect={(value) =>
                          setParams({
                            reader: { ...params.reader, ageRange: value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      性别偏好
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={params.reader.genderPreference}
                      onChange={(e) =>
                        setParams({
                          reader: {
                            ...params.reader,
                            genderPreference: e.target.value as any,
                          },
                        })
                      }
                      className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="male">男频</option>
                      <option value="female">女频</option>
                      <option value="all">通用</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSelectButton
                        options={[
                          { value: "male", label: "男频" },
                          { value: "female", label: "女频" },
                          { value: "all", label: "通用" },
                        ]}
                        onSelect={(value) =>
                          setParams({
                            reader: {
                              ...params.reader,
                              genderPreference: value as any,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      核心追读诉求
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.reader.coreAppeal}
                      onChange={(e) =>
                        setParams({
                          reader: {
                            ...params.reader,
                            coreAppeal: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="爽点 / 泪点 / 悬疑感 / 治愈感"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="读者读小说核心诉求"
                        rules="从爽点/泪点/悬疑感/治愈感/刀感/反转/脑洞 这些里面选或者组合"
                        count={10}
                        onSelect={(value) =>
                          setParams({
                            reader: { ...params.reader, coreAppeal: value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      读者雷区
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.reader.taboo}
                      onChange={(e) =>
                        setParams({
                          reader: { ...params.reader, taboo: e.target.value },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="禁止的情节、人设、三观"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="小说读者雷区禁区"
                        rules="常见不能碰的情节，给出2-3个用逗号分开"
                        count={2}
                        onSelect={(value) =>
                          setParams({
                            reader: { ...params.reader, taboo: value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      目标平台文风
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={params.reader.targetPlatform}
                      onChange={(e) =>
                        setParams({
                          reader: {
                            ...params.reader,
                            targetPlatform: e.target.value as any,
                          },
                        })
                      }
                      className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="tomato">番茄</option>
                      <option value="qidian">起点</option>
                      <option value="jjwxc">晋江</option>
                      <option value="zhihu">知乎</option>
                      <option value="short">短篇</option>
                      <option value="article">公众号</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSelectButton
                        options={[
                          { value: "tomato", label: "番茄" },
                          { value: "qidian", label: "起点" },
                          { value: "jjwxc", label: "晋江" },
                          { value: "zhihu", label: "知乎" },
                          { value: "short", label: "短篇" },
                          { value: "article", label: "公众号" },
                        ]}
                        onSelect={(value) =>
                          setParams({
                            reader: {
                              ...params.reader,
                              targetPlatform: value as any,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* 2. 人物深度 */}
            <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
              <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
                <span className="group-open:underline">👤 人物深度</span>
              </summary>
              <div className="grid grid-cols-1 gap-y-3 mt-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      核心缺陷锚点
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.character.coreFlaw}
                      onChange={(e) =>
                        setParams({
                          character: {
                            ...params.character,
                            coreFlaw: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="懦弱 / 偏执 / 太善良"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="人物核心性格缺陷"
                        rules="给出一个具体人物缺陷关键词"
                        count={10}
                        onSelect={(value) =>
                          setParams({
                            character: { ...params.character, coreFlaw: value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      隐藏秘密强度（0-100%）
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={params.character.secretIntensity}
                      onChange={(e) =>
                        setParams({
                          character: {
                            ...params.character,
                            secretIntensity: parseInt(e.target.value),
                          },
                        })
                      }
                      className="flex-1 accent-primary"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSliderButton
                        min={0}
                        max={100}
                        fieldDescription="人物隐藏秘密强度随机"
                        onSelect={(value) =>
                          setParams({
                            character: {
                              ...params.character,
                              secretIntensity: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    高=贯穿全文的伏笔钩子
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      金句密度（每一千字）
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={1}
                      value={params.character.goldenSentencePerThousand}
                      onChange={(e) =>
                        setParams({
                          character: {
                            ...params.character,
                            goldenSentencePerThousand: parseInt(e.target.value),
                          },
                        })
                      }
                      className="flex-1 accent-primary"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSliderButton
                        min={0}
                        max={5}
                        fieldDescription="金句密度随机"
                        onSelect={(value) =>
                          setParams({
                            character: {
                              ...params.character,
                              goldenSentencePerThousand: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    适合传播平台的记忆点句子
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      人物弧光要求
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={params.character.arcType}
                      onChange={(e) =>
                        setParams({
                          character: {
                            ...params.character,
                            arcType: e.target.value as any,
                          },
                        })
                      }
                      className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="none">无弧光 / 不变态</option>
                      <option value="positive">成长弧光</option>
                      <option value="fall">堕落弧光</option>
                      <option value="complex">复杂反转</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSelectButton
                        options={[
                          { value: "none", label: "无弧光 / 不变态" },
                          { value: "positive", label: "成长弧光" },
                          { value: "fall", label: "堕落弧光" },
                          { value: "complex", label: "复杂反转" },
                        ]}
                        onSelect={(value) =>
                          setParams({
                            character: {
                              ...params.character,
                              arcType: value as any,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    给配角分配背景故事
                  </label>
                  <input
                    type="checkbox"
                    checked={params.character.supportingBackstory}
                    onChange={(e) =>
                      setParams({
                        character: {
                          ...params.character,
                          supportingBackstory: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                </div>
              </div>
            </details>

            {/* 3. 情节架构 */}
            <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
              <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
                <span className="group-open:underline">🧩 情节架构</span>
              </summary>
              <div className="grid grid-cols-1 gap-y-3 mt-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      开篇钩子长度（字数）
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={100}
                      max={5000}
                      value={params.plot.hookWordCount}
                      onChange={(e) =>
                        setParams({
                          plot: {
                            ...params.plot,
                            hookWordCount: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="建议300-800字"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="开篇钩子建议字数"
                        rules="只返回一个数字，单位字"
                        count={10}
                        onSelect={(value) => {
                          const num = parseInt(value.replace(/\D/g, ""));
                          if (!isNaN(num))
                            setParams({
                              plot: { ...params.plot, hookWordCount: num },
                            });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      反转密度要求（千字几次）
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={0.5}
                      value={params.plot.twistPerThousand}
                      onChange={(e) =>
                        setParams({
                          plot: {
                            ...params.plot,
                            twistPerThousand: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="flex-1 accent-primary"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSliderButton
                        min={0}
                        max={3}
                        fieldDescription="反转密度随机"
                        onSelect={(value) =>
                          setParams({
                            plot: { ...params.plot, twistPerThousand: value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      故事结构
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={params.plot.structure}
                      onChange={(e) =>
                        setParams({
                          plot: {
                            ...params.plot,
                            structure: e.target.value as any,
                          },
                        })
                      }
                      className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="linear">线性顺叙</option>
                      <option value="inverted">倒叙开头</option>
                      <option value="interrupt">插叙补全</option>
                      <option value="multiline">多线并行</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSelectButton
                        options={[
                          { value: "linear", label: "线性顺叙" },
                          { value: "inverted", label: "倒叙开头" },
                          { value: "interrupt", label: "插叙补全" },
                          { value: "multiline", label: "多线并行" },
                        ]}
                        onSelect={(value) =>
                          setParams({
                            plot: { ...params.plot, structure: value as any },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    开篇强制冲突
                  </label>
                  <input
                    type="checkbox"
                    checked={params.plot.forceConflictAtStart}
                    onChange={(e) =>
                      setParams({
                        plot: {
                          ...params.plot,
                          forceConflictAtStart: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    埋关键伏笔
                  </label>
                  <input
                    type="checkbox"
                    checked={params.plot.seedForeshadow}
                    onChange={(e) =>
                      setParams({
                        plot: {
                          ...params.plot,
                          seedForeshadow: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    开放式结尾
                  </label>
                  <input
                    type="checkbox"
                    checked={params.plot.openEnding}
                    onChange={(e) =>
                      setParams({
                        plot: { ...params.plot, openEnding: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                </div>
              </div>
            </details>

            {/* 4. 节奏掌控 */}
            <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
              <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
                <span className="group-open:underline">⏱️ 节奏掌控</span>
              </summary>
              <div className="grid grid-cols-1 gap-y-3 mt-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      平均段落长度
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={params.rhythm.averageParaLength}
                      onChange={(e) =>
                        setParams({
                          rhythm: {
                            ...params.rhythm,
                            averageParaLength: e.target.value as any,
                          },
                        })
                      }
                      className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="short">短段落（网文）</option>
                      <option value="medium">中等段落</option>
                      <option value="long">长段落（出版）</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSelectButton
                        options={[
                          { value: "short", label: "短段落（网文）" },
                          { value: "medium", label: "中等段落" },
                          { value: "long", label: "长段落（出版）" },
                        ]}
                        onSelect={(value) =>
                          setParams({
                            rhythm: {
                              ...params.rhythm,
                              averageParaLength: value as any,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      冲突频率: {params.rhythm.conflictFrequency}%
                    </label>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSliderButton
                        min={0}
                        max={100}
                        fieldDescription="冲突频率随机"
                        onSelect={(value) =>
                          setParams({
                            rhythm: {
                              ...params.rhythm,
                              conflictFrequency: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={params.rhythm.conflictFrequency}
                    onChange={(e) =>
                      setParams({
                        rhythm: {
                          ...params.rhythm,
                          conflictFrequency: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    避免全程流水账，高频率更紧凑
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    缓冲节点插入
                  </label>
                  <input
                    type="checkbox"
                    checked={params.rhythm.bufferNodes}
                    onChange={(e) =>
                      setParams({
                        rhythm: {
                          ...params.rhythm,
                          bufferNodes: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                </div>
              </div>
            </details>
            {/* 5. 感官细节 */}
            <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
              <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
                <span className="group-open:underline">👀 感官细节</span>
              </summary>
              <div className="grid grid-cols-1 gap-y-3 mt-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      五感描写比例
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.detail.senseRatio}
                      onChange={(e) =>
                        setParams({
                          detail: {
                            ...params.detail,
                            senseRatio: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="视/听/嗅/味/触分配"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="五感官描写比例分配"
                        rules="比如：视觉60% + 听觉25% + 嗅觉10% + 触觉5%"
                        count={10}
                        onSelect={(value) =>
                          setParams({
                            detail: { ...params.detail, senseRatio: value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      时代/地域专属细节
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.detail.locationDetails}
                      onChange={(e) =>
                        setParams({
                          detail: {
                            ...params.detail,
                            locationDetails: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="方言 / 老物件 / 特色场景"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="小说故事发生的时代地域专属细节"
                        rules="给出具体时代地域特色细节，比如 90年代广州电子厂"
                        count={10}
                        onSelect={(value) =>
                          setParams({
                            detail: {
                              ...params.detail,
                              locationDetails: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      环境氛围锚点
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={params.detail.atmosphere}
                      onChange={(e) =>
                        setParams({
                          detail: {
                            ...params.detail,
                            atmosphere: e.target.value as any,
                          },
                        })
                      }
                      className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="depressed">压抑</option>
                      <option value="warm">温暖</option>
                      <option value="relaxed">轻松</option>
                      <option value="tense">紧张</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSelectButton
                        options={[
                          { value: "depressed", label: "压抑" },
                          { value: "warm", label: "温暖" },
                          { value: "relaxed", label: "轻松" },
                          { value: "tense", label: "紧张" },
                        ]}
                        onSelect={(value) =>
                          setParams({
                            detail: {
                              ...params.detail,
                              atmosphere: value as any,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    生活化随机插曲
                  </label>
                  <input
                    type="checkbox"
                    checked={params.detail.randomInterlude}
                    onChange={(e) =>
                      setParams({
                        detail: {
                          ...params.detail,
                          randomInterlude: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                </div>
              </div>
            </details>

            {/* 6. 情感共鸣 */}
            <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
              <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
                <span className="group-open:underline">❤️ 情感共鸣</span>
              </summary>
              <div className="grid grid-cols-1 gap-y-3 mt-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      情感递进阶梯
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.emotion.progression}
                      onChange={(e) =>
                        setParams({
                          emotion: {
                            ...params.emotion,
                            progression: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="陌生→好奇→共情→动容"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="情感递进阶梯"
                        rules="读者情感递进路径，比如陌生→好奇→共情→动容"
                        count={10}
                        onSelect={(value) =>
                          setParams({
                            emotion: {
                              ...params.emotion,
                              progression: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      共情触发场景（多选用逗号分隔）
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.emotion.empathyScenes}
                      onChange={(e) =>
                        setParams({
                          emotion: {
                            ...params.emotion,
                            empathyScenes: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="遗憾 / 意难平 / 救赎 / 团圆 / 逆袭"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="共情触发场景组合"
                        rules="从遗憾 / 意难平 / 救赎 / 团圆 / 逆袭 选1-3个组合"
                        count={10}
                        onSelect={(value) =>
                          setParams({
                            emotion: {
                              ...params.emotion,
                              empathyScenes: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      人物情感流露方式
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={params.emotion.expressionStyle}
                      onChange={(e) =>
                        setParams({
                          emotion: {
                            ...params.emotion,
                            expressionStyle: e.target.value as any,
                          },
                        })
                      }
                      className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="reserved">内敛</option>
                      <option value="direct">直白</option>
                      <option value="insincere">口是心非</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSelectButton
                        options={[
                          { value: "reserved", label: "内敛" },
                          { value: "direct", label: "直白" },
                          { value: "insincere", label: "口是心非" },
                        ]}
                        onSelect={(value) =>
                          setParams({
                            emotion: {
                              ...params.emotion,
                              expressionStyle: value as any,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      核心情绪落点
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={params.emotion.coreEmotion}
                      onChange={(e) =>
                        setParams({
                          emotion: {
                            ...params.emotion,
                            coreEmotion: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                      placeholder="全文想让读者记住的 feeling"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomButton
                        fieldDescription="小说整体核心情绪落点"
                        rules="全文想让读者记住什么感觉"
                        count={10}
                        onSelect={(value) =>
                          setParams({
                            emotion: { ...params.emotion, coreEmotion: value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* 7. 反AI化 */}
            <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
              <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
                <span className="group-open:underline">🤖 反AI化优化</span>
              </summary>
              <div className="grid grid-cols-1 gap-y-3 mt-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      模板化句式删除比例: {params.antiAI.templateDeletePercent}%
                    </label>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSliderButton
                        min={0}
                        max={100}
                        fieldDescription="模板化句式删除比例随机"
                        onSelect={(value) =>
                          setParams({
                            antiAI: {
                              ...params.antiAI,
                              templateDeletePercent: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={params.antiAI.templateDeletePercent}
                    onChange={(e) =>
                      setParams({
                        antiAI: {
                          ...params.antiAI,
                          templateDeletePercent: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    删除 "只见 / 就在这时 / 殊不知" 等模板句
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      口语化语病容忍度: {params.antiAI.casualTolerance}%
                    </label>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSliderButton
                        min={0}
                        max={100}
                        fieldDescription="口语化语病容忍度随机"
                        onSelect={(value) =>
                          setParams({
                            antiAI: {
                              ...params.antiAI,
                              casualTolerance: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={params.antiAI.casualTolerance}
                    onChange={(e) =>
                      setParams({
                        antiAI: {
                          ...params.antiAI,
                          casualTolerance: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    真人写作的小随性，非语法病句
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      非标准化转折概率: {params.antiAI.unpredictableTurnPercent}
                      %
                    </label>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSliderButton
                        min={0}
                        max={100}
                        fieldDescription="非标准化转折概率随机"
                        onSelect={(value) =>
                          setParams({
                            antiAI: {
                              ...params.antiAI,
                              unpredictableTurnPercent: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={params.antiAI.unpredictableTurnPercent}
                    onChange={(e) =>
                      setParams({
                        antiAI: {
                          ...params.antiAI,
                          unpredictableTurnPercent: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    拒绝AI式可预测转折
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      生活化留白比例: {params.antiAI.whitespacePercent}%
                    </label>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSliderButton
                        min={0}
                        max={100}
                        fieldDescription="生活化留白比例随机"
                        onSelect={(value) =>
                          setParams({
                            antiAI: {
                              ...params.antiAI,
                              whitespacePercent: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={params.antiAI.whitespacePercent}
                    onChange={(e) =>
                      setParams({
                        antiAI: {
                          ...params.antiAI,
                          whitespacePercent: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    不把所有话写死，留想象空间
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      文笔个人风格锚点
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={params.antiAI.writingStyle}
                      onChange={(e) =>
                        setParams({
                          antiAI: {
                            ...params.antiAI,
                            writingStyle: e.target.value as any,
                          },
                        })
                      }
                      className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                    >
                      <option value="hard">冷硬</option>
                      <option value="soft">温柔</option>
                      <option value="sharp">犀利</option>
                      <option value="humor">诙谐</option>
                      <option value="art">文艺</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <RandomSelectButton
                        options={[
                          { value: "hard", label: "冷硬" },
                          { value: "soft", label: "温柔" },
                          { value: "sharp", label: "犀利" },
                          { value: "humor", label: "诙谐" },
                          { value: "art", label: "文艺" },
                        ]}
                        onSelect={(value) =>
                          setParams({
                            antiAI: {
                              ...params.antiAI,
                              writingStyle: value as any,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
