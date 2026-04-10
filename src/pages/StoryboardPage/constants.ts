import { VideoSettings, DistributionChannel, AnimeStyle } from "../../types";

export const RESOLUTION_OPTIONS = [
  { value: '1920x1080', label: '1920x1080 (16:9)' },
  { value: '1280x720', label: '1280x720 (16:9)' },
  { value: '720x1280', label: '720x1280 (9:16)' },
  { value: '1080x1920', label: '1080x1920 (9:16)' },
] as const;

export const FPS_OPTIONS = [24, 30, 60] as const;

export const CHANNEL_OPTIONS: DistributionChannel[] = [
  '抖音', '快手', 'B站', '视频号', '小红书', 'YouTube', 'TikTok', '多平台'
];

export const STYLE_OPTIONS: AnimeStyle[] = [
  'anime', 'realistic', 'ink', '3d', 'cartoon', 'semi-realistic', 'cel-shaded'
];

export const STYLE_LABELS: Record<AnimeStyle, string> = {
  'anime': '动漫',
  'realistic': '写实',
  'ink': '水墨',
  '3d': '3D',
  'cartoon': '卡通',
  'semi-realistic': '半写实',
  'cel-shaded': '赛璐珞',
};

export const DEFAULT_SETTINGS: VideoSettings = {
  resolution: '1080x1920',
  aspectRatio: '9:16',
  fps: 30,
  format: 'mp4',
  duration: 60,
  clipDuration: 10,
  clipsPerEpisode: 6,
  distributionChannel: '抖音',
};
