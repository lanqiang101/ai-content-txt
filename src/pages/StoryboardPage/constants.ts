import { VideoSettings, DistributionChannel, AnimeStyle, ComicSettings } from "../../types";

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

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  resolution: '1080x1920',
  aspectRatio: '9:16',
  fps: 30,
  format: 'mp4',
  duration: 60,
  clipDuration: 10,
  clipsPerEpisode: 6,
  distributionChannel: '抖音',
};

// 漫画常量
export const COMIC_FORMAT_OPTIONS = [
  { value: 'vertical_strip', label: '竖屏条漫' },
  { value: 'horizontal_page', label: '横版页漫' },
] as const;

export const COMIC_FRAME_LAYOUT_OPTIONS = [
  { value: 'vertical', label: '上下排布' },
  { value: 'horizontal', label: '左右排布' },
  { value: 'mixed', label: '大小穿插' },
  { value: 'closeup_lead', label: '特写主导' },
] as const;

export const COMIC_READ_ORDER_OPTIONS = [
  { value: 'top_to_bottom', label: '从上到下（条漫）' },
  { value: 'right_to_left', label: '从右到左（日系）' },
  { value: 'left_to_right', label: '从左到右（国漫）' },
] as const;

export const COMIC_ASPECT_RATIO_OPTIONS = [
  { value: '1:1', label: '1:1 方形' },
  { value: '16:9', label: '16:9 宽屏' },
  { value: '9:16', label: '9:16 竖屏' },
  { value: '4:3', label: '4:3 标准' },
] as const;

export const COMIC_OUTPUT_FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'webp', label: 'WebP' },
] as const;

export const DEFAULT_COMIC_SETTINGS: ComicSettings = {
  comicFormat: 'vertical_strip',
  frameCount: 6,
  frameLayout: 'vertical',
  readOrder: 'top_to_bottom',
  aspectRatio: '9:16',
  outputFormat: 'png',
};
