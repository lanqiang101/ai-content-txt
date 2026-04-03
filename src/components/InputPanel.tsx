import React from 'react';
import { useStore } from '../store/useStore';
import { RefreshCw } from 'lucide-react';
import { RandomButton, RandomSliderButton, RandomSelectButton } from './RandomButton';

export const InputPanel: React.FC = () => {
  const { params, setParams, resetGeneration } = useStore();

  const handleReset = () => {
    resetGeneration();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg card-gradient p-6 mb-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800">创作参数</h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
        >
          <RefreshCw size={16} />
          重置
        </button>
      </div>

      <div className="space-y-5">
        {/* 基础参数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                params.type === 'article'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setParams({ type: 'article' })}
            >
              公众号文章
            </button>
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                params.type === 'novel'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setParams({ type: 'novel' })}
            >
              小说
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">主题</label>
            <RandomButton
              fieldDescription="热门网络小说主题"
              rules="生成当前热门热门的小说主题，要求具体不笼统"
              count={3}
              onSelect={(value) => setParams({ topic: value })}
            />
          </div>
          <input
            type="text"
            value={params.topic}
            onChange={(e) => setParams({ topic: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 backdrop-blur"
            placeholder="请输入小说主题..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">关键词（用逗号分隔）</label>
            <RandomButton
              fieldDescription="根据主题生成3-5个小说关键词"
              rules="关键词之间用逗号分隔"
              count={1}
              onSelect={(value) => setParams({ keywords: value })}
            />
          </div>
          <input
            type="text"
            value={params.keywords}
            onChange={(e) => setParams({ keywords: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 backdrop-blur"
            placeholder="AI, 未来科技, 都市异能..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">期望字数（字）</label>
            <RandomButton
              fieldDescription="根据小说常见篇幅随机生成期望字数，要符合平台常规"
              rules="只返回一个数字，不要单位"
              count={1}
              onSelect={(value) => {
                const num = parseInt(value.replace(/\D/g, ''));
                if (!isNaN(num)) setParams({ wordCount: num });
              }}
            />
          </div>
          <input
            type="number"
            value={params.wordCount}
            onChange={(e) => setParams({ wordCount: parseInt(e.target.value) })}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 backdrop-blur"
            placeholder="期望生成多少字..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">整体文风</label>
            <RandomButton
              fieldDescription="整体文章文风形容词"
              rules="生成3种不同文风，每种1-3个词"
              count={3}
              onSelect={(value) => setParams({ style: value })}
            />
          </div>
          <input
            type="text"
            value={params.style}
            onChange={(e) => setParams({ style: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 backdrop-blur"
            placeholder="轻松幽默，都市豪门..."
          />
        </div>

        {/* ========== 七大参数分组 - 只在小说类型显示 ========== */}
        {params.type === 'novel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          {/* 1. 读者定位 */}
          <details className="group open rounded-xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-medium text-gray-800">
              <span className="group-open:underline">🔍 读者定位</span>
            </summary>
            <div className="grid grid-cols-1 gap-y-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">读者年龄层</label>
                  <RandomButton
                    fieldDescription="常见网络小说读者年龄范围"
                    rules="常见年龄范围，比如 18-25岁"
                    count={3}
                    onSelect={(value) => setParams({ reader: { ...params.reader, ageRange: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.reader.ageRange}
                  onChange={(e) => setParams({ reader: { ...params.reader, ageRange: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="18-25岁"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">性别偏好</label>
                  <RandomSelectButton
                    options={[
                      { value: 'male', label: '男频' },
                      { value: 'female', label: '女频' },
                      { value: 'all', label: '通用' },
                    ]}
                    onSelect={(value) => setParams({ reader: { ...params.reader, genderPreference: value as any } })}
                  />
                </div>
                <select
                  value={params.reader.genderPreference}
                  onChange={(e) => setParams({ reader: { ...params.reader, genderPreference: e.target.value as any } })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="male">男频</option>
                  <option value="female">女频</option>
                  <option value="all">通用</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">核心追读诉求</label>
                  <RandomButton
                    fieldDescription="读者读小说核心诉求"
                    rules="从爽点/泪点/悬疑感/治愈感/刀感/反转/脑洞 这些里面选或者组合"
                    count={3}
                    onSelect={(value) => setParams({ reader: { ...params.reader, coreAppeal: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.reader.coreAppeal}
                  onChange={(e) => setParams({ reader: { ...params.reader, coreAppeal: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="爽点 / 泪点 / 悬疑感 / 治愈感"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">读者雷区</label>
                  <RandomButton
                    fieldDescription="小说读者雷区禁区"
                    rules="常见不能碰的情节，给出2-3个用逗号分开"
                    count={2}
                    onSelect={(value) => setParams({ reader: { ...params.reader, taboo: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.reader.taboo}
                  onChange={(e) => setParams({ reader: { ...params.reader, taboo: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="禁止的情节、人设、三观"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">目标平台文风</label>
                  <RandomSelectButton
                    options={[
                      { value: 'tomato', label: '番茄' },
                      { value: 'qidian', label: '起点' },
                      { value: 'jjwxc', label: '晋江' },
                      { value: 'zhihu', label: '知乎' },
                      { value: 'short', label: '短篇' },
                      { value: 'article', label: '公众号' },
                    ]}
                    onSelect={(value) => setParams({ reader: { ...params.reader, targetPlatform: value as any } })}
                  />
                </div>
                <select
                  value={params.reader.targetPlatform}
                  onChange={(e) => setParams({ reader: { ...params.reader, targetPlatform: e.target.value as any } })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="tomato">番茄</option>
                  <option value="qidian">起点</option>
                  <option value="jjwxc">晋江</option>
                  <option value="zhihu">知乎</option>
                  <option value="short">短篇</option>
                  <option value="article">公众号</option>
                </select>
              </div>
            </div>
          </details>

          {/* 2. 人物深度 */}
          <details className="group open rounded-xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-medium text-gray-800">
              <span className="group-open:underline">👤 人物深度</span>
            </summary>
            <div className="grid grid-cols-1 gap-y-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">核心缺陷锚点</label>
                  <RandomButton
                    fieldDescription="人物核心性格缺陷，让人物不完美"
                    rules="给小说主角设计一个真实的缺点，不是那种假缺点，要真实有共鸣"
                    count={3}
                    onSelect={(value) => setParams({ character: { ...params.character, coreFlaw: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.character.coreFlaw}
                  onChange={(e) => setParams({ character: { ...params.character, coreFlaw: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="人物不完美，AI最爱写完美人设"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">行为逻辑底层动机</label>
                  <RandomButton
                    fieldDescription="人物行为的底层动机"
                    rules="基于人物缺陷，给出底层动机，比如原生家庭/童年阴影/执念/遗憾/仇恨"
                    count={3}
                    onSelect={(value) => setParams({ character: { ...params.character, motivation: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.character.motivation}
                  onChange={(e) => setParams({ character: { ...params.character, motivation: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="原生家庭 / 执念 / 遗憾"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">微习惯 / 口头禅 / 小癖好</label>
                  <RandomButton
                    fieldDescription="人物的小习惯口头禅或者小癖好"
                    rules="生活化，真实，增加人物真实感"
                    count={3}
                    onSelect={(value) => setParams({ character: { ...params.character, habits: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.character.habits}
                  onChange={(e) => setParams({ character: { ...params.character, habits: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="增加人物真实感"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">情绪反差阈值</label>
                  <RandomButton
                    fieldDescription="人物情绪反差，平时什么样，什么情况会爆发"
                    rules="格式：平时温和→触碰底线爆发"
                    count={3}
                    onSelect={(value) => setParams({ character: { ...params.character, emotionThreshold: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.character.emotionThreshold}
                  onChange={(e) => setParams({ character: { ...params.character, emotionThreshold: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="平时温和→爆发点"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">成长弧光节点</label>
                  <RandomButton
                    fieldDescription="人物成长弧光各阶段改变节点"
                    rules="设计人物成长关键改变点"
                    count={3}
                    onSelect={(value) => setParams({ character: { ...params.character, growthArc: value } })}
                  />
                </div>
                <input                  type="text"
                  value={params.character.growthArc}
                  onChange={(e) => setParams({ character: { ...params.character, growthArc: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="各阶段人物改变节点"
                />
              </div>
            </div>
          </details>

          {/* 3. 情节连贯 */}
          <details className="group open rounded-xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-medium text-gray-800">
              <span className="group-open:underline">🔗 情节连贯</span>
            </summary>
            <div className="grid grid-cols-1 gap-y-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">主线逻辑链节点</label>
                  <RandomButton
                    fieldDescription="小说主线故事逻辑链，起承转合"
                    rules="给出完整的起承转合主线脉络，一句话说明"
                    count={1}
                    onSelect={(value) => setParams({ plot: { ...params.plot, mainChain: value } })}
                  />
                </div>
                <textarea
                  value={params.plot.mainChain}
                  onChange={(e) => setParams({ plot: { ...params.plot, mainChain: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[60px]"
                  placeholder="起→承→转→合关键步骤"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">伏笔埋设+回收计划表</label>
                  <RandomButton
                    fieldDescription="小说伏笔埋设和回收计划"
                    rules="设计2-3个伏笔，说明哪里埋哪里收"
                    count={1}
                    onSelect={(value) => setParams({ plot: { ...params.plot, foreshadowing: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.plot.foreshadowing}
                  onChange={(e) => setParams({ plot: { ...params.plot, foreshadowing: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="前埋后收，防AI忘记伏笔"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">支线与主线绑定比例: {params.plot.branchRatio}%</label>
                  <RandomSliderButton
                    min={0}
                    max={100}
                    fieldDescription="支线与主线绑定比例随机"
                    onSelect={(value) => setParams({ plot: { ...params.plot, branchRatio: value } })}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.plot.branchRatio}
                  onChange={(e) => setParams({ plot: { ...params.plot, branchRatio: parseInt(e.target.value) } })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-gray-500 mt-1">禁止无关支线，越高比例绑定越紧密</p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">情节因果强制约束</label>
                <input
                  type="checkbox"
                  checked={params.plot.causalConstraint}
                  onChange={(e) => setParams({ plot: { ...params.plot, causalConstraint: e.target.checked } })}
                  className="w-4 h-4 accent-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">反转合理性校验</label>
                <input
                  type="checkbox"
                  checked={params.plot.checkReversal}
                  onChange={(e) => setParams({ plot: { ...params.plot, checkReversal: e.target.checked } })}
                  className="w-4 h-4 accent-primary"
                />
              </div>
            </div>
          </details>

          {/* 4. 节奏张力 */}
          <details className="group open rounded-xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-medium text-gray-800">
              <span className="group-open:underline">⚡ 节奏张力</span>
            </summary>
            <div className="grid grid-cols-1 gap-y-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">快慢节奏交替比例</label>
                  <RandomButton
                    fieldDescription="快慢节奏交替安排"
                    rules="常见快慢节奏组合，比如 3段平淡 + 1段高潮"
                    count={3}
                    onSelect={(value) => setParams({ rhythm: { ...params.rhythm, alternation: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.rhythm.alternation}
                  onChange={(e) => setParams({ rhythm: { ...params.rhythm, alternation: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="例如：3段平淡 + 1段高潮"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">小/中/大高潮密度</label>
                  <RandomButton
                    fieldDescription="小说高低潮密度安排"
                    rules="比如：每3k字小高潮，每1w字中高潮"
                    count={3}
                    onSelect={(value) => setParams({ rhythm: { ...params.rhythm, climaxDensity: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.rhythm.climaxDensity}
                  onChange={(e) => setParams({ rhythm: { ...params.rhythm, climaxDensity: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="例如：每3k小高潮，每1w中高潮"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">每章结尾悬念留存</label>
                <input
                  type="checkbox"
                  checked={params.rhythm.chapterEndHook}
                  onChange={(e) => setParams({ rhythm: { ...params.rhythm, chapterEndHook: e.target.checked } })}
                  className="w-4 h-4 accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">冲突触发频率: {params.rhythm.conflictFrequency}</label>
                  <RandomSliderButton
                    min={0}
                    max={100}
                    fieldDescription="冲突触发频率随机"
                    onSelect={(value) => setParams({ rhythm: { ...params.rhythm, conflictFrequency: value } })}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.rhythm.conflictFrequency}
                  onChange={(e) => setParams({ rhythm: { ...params.rhythm, conflictFrequency: parseInt(e.target.value) } })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-gray-500 mt-1">避免全程流水账，高频率更紧凑</p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">松弛缓冲节点</label>
                <input
                  type="checkbox"
                  checked={params.rhythm.bufferNodes}
                  onChange={(e) => setParams({ rhythm: { ...params.rhythm, bufferNodes: e.target.checked } })}
                  className="w-4 h-4 accent-primary"
                />
              </div>
            </div>
          </details>

          {/* 5. 感官细节 */}
          <details className="group open rounded-xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-medium text-gray-800">
              <span className="group-open:underline">👀 感官细节</span>
            </summary>
            <div className="grid grid-cols-1 gap-y-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">五感描写比例</label>
                  <RandomButton
                    fieldDescription="五感官描写比例分配"
                    rules="比如：视觉60% + 听觉25% + 嗅觉10% + 触觉5%"
                    count={3}
                    onSelect={(value) => setParams({ detail: { ...params.detail, senseRatio: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.detail.senseRatio}
                  onChange={(e) => setParams({ detail: { ...params.detail, senseRatio: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="视/听/嗅/味/触分配"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">时代/地域专属细节</label>
                  <RandomButton
                    fieldDescription="小说故事发生的时代地域专属细节"
                    rules="给出具体时代地域特色细节，比如 90年代广州电子厂"
                    count={3}
                    onSelect={(value) => setParams({ detail: { ...params.detail, locationDetails: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.detail.locationDetails}
                  onChange={(e) => setParams({ detail: { ...params.detail, locationDetails: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="方言 / 老物件 / 特色场景"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">环境氛围锚点</label>
                  <RandomSelectButton
                    options={[
                      { value: 'depressed', label: '压抑' },
                      { value: 'warm', label: '温暖' },
                      { value: 'relaxed', label: '轻松' },
                      { value: 'tense', label: '紧张' },
                    ]}
                    onSelect={(value) => setParams({ detail: { ...params.detail, atmosphere: value as any } })}
                  />
                </div>
                <select
                  value={params.detail.atmosphere}
                  onChange={(e) => setParams({ detail: { ...params.detail, atmosphere: e.target.value as any } })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="depressed">压抑</option>
                  <option value="warm">温暖</option>
                  <option value="relaxed">轻松</option>
                  <option value="tense">紧张</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">生活化随机插曲</label>
                <input
                  type="checkbox"
                  checked={params.detail.randomInterlude}
                  onChange={(e) => setParams({ detail: { ...params.detail, randomInterlude: e.target.checked } })}
                  className="w-4 h-4 accent-primary"
                />
              </div>
            </div>
          </details>

          {/* 6. 情感共鸣 */}
          <details className="group open rounded-xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-medium text-gray-800">
              <span className="group-open:underline">❤️ 情感共鸣</span>
            </summary>
            <div className="grid grid-cols-1 gap-y-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">情感递进阶梯</label>
                  <RandomButton
                    fieldDescription="情感递进阶梯"
                    rules="读者情感递进路径，比如陌生→好奇→共情→动容"
                    count={3}
                    onSelect={(value) => setParams({ emotion: { ...params.emotion, progression: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.emotion.progression}
                  onChange={(e) => setParams({ emotion: { ...params.emotion, progression: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="陌生→好奇→共情→动容"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">共情触发场景（多选用逗号分隔）</label>
                  <RandomButton
                    fieldDescription="共情触发场景组合"
                    rules="从遗憾 / 意难平 / 救赎 / 团圆 / 逆袭 选1-3个组合"
                    count={3}
                    onSelect={(value) => setParams({ emotion: { ...params.emotion, empathyScenes: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.emotion.empathyScenes}
                  onChange={(e) => setParams({ emotion: { ...params.emotion, empathyScenes: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="遗憾 / 意难平 / 救赎 / 团圆 / 逆袭"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">人物情感流露方式</label>
                  <RandomSelectButton
                    options={[
                      { value: 'reserved', label: '内敛' },
                      { value: 'direct', label: '直白' },
                      { value: 'insincere', label: '口是心非' },
                    ]}
                    onSelect={(value) => setParams({ emotion: { ...params.emotion, expressionStyle: value as any } })}
                  />
                </div>
                <select
                  value={params.emotion.expressionStyle}
                  onChange={(e) => setParams({ emotion: { ...params.emotion, expressionStyle: e.target.value as any } })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="reserved">内敛</option>
                  <option value="direct">直白</option>
                  <option value="insincere">口是心非</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">核心情绪落点</label>
                  <RandomButton
                    fieldDescription="小说整体核心情绪落点"
                    rules="全文想让读者记住什么感觉"
                    count={3}
                    onSelect={(value) => setParams({ emotion: { ...params.emotion, coreEmotion: value } })}
                  />
                </div>
                <input
                  type="text"
                  value={params.emotion.coreEmotion}
                  onChange={(e) => setParams({ emotion: { ...params.emotion, coreEmotion: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="全文想让读者记住的 feeling"
                />
              </div>
            </div>
          </details>

          {/* 7. 反AI化 */}
          <details className="group open rounded-xl border border-gray-200 p-4">
            <summary className="cursor-pointer font-medium text-gray-800">
              <span className="group-open:underline">🤖 反AI化优化</span>
            </summary>
            <div className="grid grid-cols-1 gap-y-3 mt-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">模板化句式删除比例: {params.antiAI.templateDeletePercent}%</label>
                  <RandomSliderButton
                    min={0}
                    max={100}
                    fieldDescription="模板化句式删除比例随机"
                    onSelect={(value) => setParams({ antiAI: { ...params.antiAI, templateDeletePercent: value } })}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.antiAI.templateDeletePercent}
                  onChange={(e) => setParams({ antiAI: { ...params.antiAI, templateDeletePercent: parseInt(e.target.value) } })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-gray-500 mt-1">删除 "只见 / 就在这时 / 殊不知" 等模板句</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">口语化语病容忍度: {params.antiAI.casualTolerance}%</label>
                  <RandomSliderButton
                    min={0}
                    max={100}
                    fieldDescription="口语化语病容忍度随机"
                    onSelect={(value) => setParams({ antiAI: { ...params.antiAI, casualTolerance: value } })}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={100}
                  value={params.antiAI.casualTolerance}
                  onChange={(e) => setParams({ antiAI: { ...params.antiAI, casualTolerance: parseInt(e.target.value) } })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-gray-500 mt-1">真人写作的小随性，非语法病句</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">非标准化转折概率: {params.antiAI.unpredictableTurnPercent}%</label>
                  <RandomSliderButton
                    min={0}
                    max={100}
                    fieldDescription="非标准化转折概率随机"
                    onSelect={(value) => setParams({ antiAI: { ...params.antiAI, unpredictableTurnPercent: value } })}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={100}
                  value={params.antiAI.unpredictableTurnPercent}
                  onChange={(e) => setParams({ antiAI: { ...params.antiAI, unpredictableTurnPercent: parseInt(e.target.value) } })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-gray-500 mt-1">拒绝AI式可预测转折</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">生活化留白比例: {params.antiAI.whitespacePercent}%</label>
                  <RandomSliderButton
                    min={0}
                    max={100}
                    fieldDescription="生活化留白比例随机"
                    onSelect={(value) => setParams({ antiAI: { ...params.antiAI, whitespacePercent: value } })}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={100}
                  value={params.antiAI.whitespacePercent}
                  onChange={(e) => setParams({ antiAI: { ...params.antiAI, whitespacePercent: parseInt(e.target.value) } })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-gray-500 mt-1">不把所有话写死，留想象空间</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 block">文笔个人风格锚点</label>
                  <RandomSelectButton
                    options={[
                      { value: 'hard', label: '冷硬' },
                      { value: 'soft', label: '温柔' },
                      { value: 'sharp', label: '犀利' },
                      { value: 'humor', label: '诙谐' },
                      { value: 'art', label: '文艺' },
                    ]}
                    onSelect={(value) => setParams({ antiAI: { ...params.antiAI, writingStyle: value as any } })}
                  />
                </div>
                <select
                  value={params.antiAI.writingStyle}
                  onChange={(e) => setParams({ antiAI: { ...params.antiAI, writingStyle: e.target.value as any } })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="hard">冷硬</option>
                  <option value="soft">温柔</option>
                  <option value="sharp">犀利</option>
                  <option value="humor">诙谐</option>
                  <option value="art">文艺</option>
                </select>
              </div>
            </div>
          </details>
        </div>
        )}

      </div>
    </div>
  );
};
