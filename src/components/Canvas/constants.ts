export type NodeKind = 'text' | 'image' | 'video' | 'audio'

export type NodeMode = 'picker' | 'editor'

export type UploadState = 'idle' | 'uploading' | 'done'

export type ImageGenTask = 'picker' | 'img2img' | 'hd'

export interface CanvasNodeData {
  kind: NodeKind
  title: string
  mode: NodeMode
  content: string
  uploadState: UploadState
  uploadProgress: number
  mediaWidth: number
  mediaHeight: number
  previewUrl: string
  fileName: string
  isSelected?: boolean
  imageGenTask?: ImageGenTask
  sourceNodeId?: string
  sourcePreviewUrl?: string
  sourceFileName?: string
  inputUpdated?: boolean
  genPrompt?: string
  genSeed?: number
  videoGenTab?: string
  viewScale?: number
}

export function createEmptyNodeData(): CanvasNodeData {
  return {
    kind: 'text',
    title: '',
    mode: 'picker',
    content: '',
    uploadState: 'idle',
    uploadProgress: 0,
    mediaWidth: 0,
    mediaHeight: 0,
    previewUrl: '',
    fileName: '',
  }
}

export const EMPTY_HINT = '双击画布 自由生成节点'

/** 图片节点标题栏高度 + 与预览区间距，用于工具栏锚定在图片区域正上方 */
export const IMAGE_NODE_META_HEIGHT = 30

/** 文本/图片/视频默认卡片宽与 2:3 比例（宽:高 = 2:3） */
export const NODE_DEFAULT_WIDTH = 180
export const NODE_DEFAULT_HEIGHT = 270

export function nodeCardSize2x3(width = NODE_DEFAULT_WIDTH) {
  return { width, height: Math.round(width * 3 / 2) }
}

/** 文本/音频 picker 底部输入框距节点底边的垂直间距 */
export const PROMPT_BAR_TOP_GAP = 62

export const CANVAS_MIN_ZOOM = 0.35
export const CANVAS_MAX_ZOOM = 2

export const ZOOM_MENU_PRESETS = [0.5, 1, 2] as const

export const NODE_TEMPLATES = [
  { kind: 'text' as const, label: '故事脚本生成', desc: '从创意生成完整故事脚本', accent: '#5b8def' },
  { kind: 'image' as const, label: '角色三视图', desc: '生成角色三视图与设定', accent: '#9b6bff' },
  { kind: 'video' as const, label: '首帧图生视频', desc: '静态图转动态视频', accent: '#3bc9a0' },
  { kind: 'audio' as const, label: '音频生视频', desc: '音频驱动画面生成', accent: '#f5a623' },
]

export type MenuIcon =
  | 'text'
  | 'image'
  | 'video'
  | 'compose'
  | 'director'
  | 'audio'
  | 'script'
  | 'upload'
  | 'history'
  | 'link'

export type ConnectMenuKey =
  | 'text'
  | 'image'
  | 'video'
  | 'compose'
  | 'director'
  | 'audio'
  | 'script'
  | 'reference'

export const CONNECT_GENERATE_MENU: Array<{
  key: ConnectMenuKey
  label: string
  icon: MenuIcon
  badge?: 'Beta' | 'NEW'
  disabled?: boolean
}> = [
  { key: 'text', label: '文本', icon: 'text' },
  { key: 'image', label: '图片', icon: 'image' },
  { key: 'video', label: '视频', icon: 'video' },
  // { key: 'compose', label: '视频合成', icon: 'compose', badge: 'Beta' },
  // { key: 'director', label: '导演台', icon: 'director', badge: 'NEW' },
  // { key: 'audio', label: '音频', icon: 'audio', disabled: true },
  // { key: 'script', label: '脚本', icon: 'script', badge: 'Beta' },
  { key: 'reference', label: '参考节点', icon: 'link', disabled: true },
]

export const ADD_NODE_GROUPS = [
  {
    title: '添加节点',
    items: [
      { kind: 'text' as const, label: '文本', desc: '脚本、广告词、品牌文案', icon: 'text' as MenuIcon },
      { kind: 'image' as const, label: '图片', desc: '海报、封面、素材图', icon: 'image' as MenuIcon },
      { kind: 'video' as const, label: '视频', desc: '短视频、动画片段', icon: 'video' as MenuIcon },
      // { kind: 'video' as const, label: '视频合成', desc: '多段素材合成', badge: 'Beta', icon: 'compose' as MenuIcon },
      // { kind: 'text' as const, label: '导演台', desc: '镜头与分镜控image.png制', badge: 'NEW', icon: 'director' as MenuIcon },
      // { kind: 'audio' as const, label: '音频', desc: '配音、音效、背景音乐', icon: 'audio' as MenuIcon },
      // { kind: 'text' as const, label: '脚本', desc: '结构化拍摄脚本', badge: 'Beta', icon: 'script' as MenuIcon },
    ],
  },
  {
    title: '添加资源',
    items: [
      { kind: 'image' as const, label: '上传', desc: '本地图片或视频', icon: 'upload' as MenuIcon, action: 'upload' as const },
      { kind: 'image' as const, label: '从生成历史选择', desc: '复用历史结果', icon: 'history' as MenuIcon, action: 'history' as const },
    ],
  },
]

export const TEXT_PICKER_ACTIONS = [
  { key: 'write', label: '自己编写内容', icon: 'doc' },
  { key: 'text2video', label: '文生视频', icon: 'play' },
  { key: 'img2prompt', label: '图片反推提示词', icon: 'image' },
  // { key: 'text2music', label: '文字生音乐', icon: 'audio' },
]

export const VIDEO_PICKER_ACTIONS = [
  // { key: 'frames', label: '首尾帧生成视频', icon: 'frames' },
  // { key: 'first', label: '首帧生成视频', icon: 'spark' },
]

export const VIDEO_GEN_TABS: Array<{ key: string; label: string; disabled?: boolean }> = [
  { key: 'text2video', label: '文生视频' },
  { key: 'reference', label: '全能参考', disabled: true },
  { key: 'img2video', label: '图生视频', disabled: true },
  { key: 'frames', label: '首尾帧', disabled: true },
  { key: 'imageRef', label: '图片参考', disabled: true },
]

export const VIDEO_GEN_QUICK_ACTIONS = [
  { key: 'mark', label: '标记', icon: 'mark' },
  { key: 'camera', label: '运镜', icon: 'camera' },
  { key: 'role', label: '角色库', icon: 'role' },
] as const

export const VIDEO_GEN_PROMPT_PLACEHOLDER = '描述你想要生成的画面内容，@引用素材'

export const IMAGE_GEN_ACTIONS = [
  { key: 'img2img' as const, label: '图生图', icon: 'img2img' },
  { key: 'hd' as const, label: '图片高清', icon: 'hd' },
]

export const IMG2IMG_PROMPT_PLACEHOLDER =
  '描述你想要生成的画面内容，按/呼出指令，@引用素材'

export const IMG2IMG_QUICK_TAGS = ['风格', '相似', '参考'] as const

export const VIDEO_NODE_TOOLBAR = {
  chat: { key: 'chat', label: '对话', icon: 'chat' as const },
  actions: [
    { key: 'clip', label: '视频剪辑', icon: 'video-edit' },
    { key: 'parse', label: '解析', icon: 'wand' },
    { key: 'hd', label: 'HD 高清', icon: 'video-hd' },
    { key: 'frames', label: '抽帧', icon: 'frames' },
    { key: 'replicate', label: '复刻', icon: 'replicate' },
    { key: 'watermark', label: '去水印', icon: 'watermark' },
    { key: 'subtitle', label: '去字幕', icon: 'subtitle' },
  ] satisfies ImageToolbarAction[],
} as const

export type ImageToolbarIcon =
  | 'chat'
  | 'cutout'
  | 'crop'
  | 'edit'
  | 'preview'
  | 'more'
  | 'back'
  | 'split'
  | 'annotate'
  | 'decompose'
  | 'erase'
  | 'search'
  | 'parse'
  | 'download'
  | 'expand'
  | 'restore'
  | 'perspective'
  | 'text-edit'
  | 'adjust'
  | 'layers'
  | 'svg'
  | 'customize'
  | 'video-edit'
  | 'wand'
  | 'video-hd'
  | 'frames'
  | 'replicate'
  | 'watermark'
  | 'subtitle'

export type ImageToolbarAction = {
  key: string
  label: string
  icon?: ImageToolbarIcon
}

export type ImageToolbarMenuItem = {
  key: string
  label: string
  icon: ImageToolbarIcon
  hasSubmenu?: boolean
}

export const IMAGE_NODE_TOOLBAR = {
  chat: { key: 'chat', label: '对话', icon: 'chat' as const },
  actions: [
    { key: 'cutout', label: '抠图', icon: 'cutout' },
    { key: 'hd', label: 'HD 高清' },
    { key: 'crop', label: '裁剪', icon: 'crop' },
    { key: 'inpaint', label: '局部修改', icon: 'edit' },
    { key: 'preview', label: '预览', icon: 'preview' },
    { key: 'more', label: '更多', icon: 'more' },
  ] satisfies ImageToolbarAction[],
} as const

export const IMAGE_NODE_TOOLBAR_MORE = {
  actions: [
    { key: 'split', label: '拆图', icon: 'split' },
    { key: 'annotate', label: '标注', icon: 'annotate' },
    { key: 'decompose', label: '元素拆解', icon: 'decompose' },
    { key: 'erase', label: '消除', icon: 'erase' },
    { key: 'search', label: '搜同款', icon: 'search' },
    { key: 'parse', label: '解析', icon: 'parse' },
    { key: 'more', label: '更多', icon: 'more' },
  ] satisfies ImageToolbarAction[],
} as const

export const IMAGE_NODE_TOOLBAR_MORE_MENU = [
  { key: 'expand', label: '扩图', icon: 'expand' },
  { key: 'restore', label: '细节还原', icon: 'restore' },
  { key: 'perspective', label: '多视角', icon: 'perspective' },
  { key: 'text-edit', label: '编辑文字', icon: 'text-edit' },
  { key: 'adjust', label: '调节', icon: 'adjust', hasSubmenu: true },
  { key: 'layers', label: '图层分离', icon: 'layers' },
  { key: 'svg', label: '矢量SVG', icon: 'svg', hasSubmenu: true },
  { key: 'customize', label: '自定义', icon: 'customize' },
] satisfies ImageToolbarMenuItem[]

export const IMAGE_DIALOGUE_GREETING = 'Hi, 我是你的AI设计助理'
export const IMAGE_DIALOGUE_PLACEHOLDER = '让我们开始创作吧...'

export const IMAGE_COLOR_DEFAULT = '#0E316A'
export const IMAGE_COLOR_SWATCHES = [
  '#9CA3AF',
  '#6B7280',
  '#374151',
  '#F97316',
  '#FBBF24',
  '#FDE047',
  '#3B82F6',
  '#0E316A',
  '#7C3AED',
  '#A855F7',
  '#22C55E',
  '#EF4444',
] as const
export const IMAGE_COLOR_PALETTE_PRESETS = [
  { key: 'default', label: '默认' },
  { key: 'warm', label: '暖色' },
  { key: 'cool', label: '冷色' },
  { key: 'mono', label: '单色' },
] as const

export const IMAGE_GEN_ASPECT_RATIO_LABEL = '宽高比'
export const IMAGE_GEN_COUNT_LABEL = '张数'
export const IMAGE_GEN_ASPECT_RATIOS = [
  { key: 'auto', label: 'auto', preview: { width: 14, height: 10 } },
  { key: '3:4', label: '3:4', preview: { width: 10, height: 14 } },
  { key: '1:1', label: '1:1', preview: { width: 12, height: 12 } },
  { key: '16:9', label: '16:9', preview: { width: 16, height: 9 } },
  { key: '9:16', label: '9:16', preview: { width: 9, height: 16 } },
  { key: '4:3', label: '4:3', preview: { width: 14, height: 10 } },
  { key: '3:2', label: '3:2', preview: { width: 15, height: 10 } },
  { key: '2:3', label: '2:3', preview: { width: 10, height: 15 } },
  { key: '4:5', label: '4:5', preview: { width: 10, height: 12 } },
  { key: '5:4', label: '5:4', preview: { width: 12, height: 10 } },
  { key: '21:9', label: '21:9', preview: { width: 18, height: 8 } },
] as const
export type ImageGenAspectRatio = (typeof IMAGE_GEN_ASPECT_RATIOS)[number]['key']
export const IMAGE_GEN_COUNTS = [1, 2, 3] as const
export type ImageGenCount = (typeof IMAGE_GEN_COUNTS)[number]

export const IMAGE_DESIGN_IPS_TITLE = '分辨率';
export const IMAGE_DESIGN_IPS_MENU = [
  {
    key: 'auto',
    label: 'auto',
  },
  {
    key: '1K',
    label: '1K',
  },
  {
    key: '2K',
    label: '2K',
  },
  {
    key: '4K',
    label: '4K',
  },
] as const

export const IMAGE_DESIGN_ADVISOR_TITLE = '设计灵感'
export const IMAGE_DESIGN_ADVISOR_MENU = [
  {
    key: 'idea',
    label: '设计思路',
    children: [
      { key: 'concept', label: '灵感发散', prompt: '请根据图片分析设计灵感，给出可落地的创意方向' },
      { key: 'style', label: '风格定位', prompt: '请根据图片提炼整体风格，并说明适用场景与人群' },
      { key: 'color', label: '配色建议', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
    ],
  },
  {
    key: 'product-shot',
    label: '商品实拍',
    children: [
      { key: '3d', label: '服装立体3D图', prompt: '请生成服装立体3D展示图，突出版型与立体感' },
      { key: 'flat', label: '服装平铺图', prompt: '请生成服装平铺展示图，背景干净、构图规整' },
      { key: 'detail', label: '服装细节图', prompt: '请生成服装细节特写图，突出工艺与材质纹理' },
      { key: 'fabric', label: '服装面料图', prompt: '请生成服装面料质感展示图，强调织物纹理与光泽' },
      { key: '360', label: '商品360°', prompt: '请生成商品360°展示方案，覆盖多角度呈现需求' },
    ],
  },
  {
    key: 'product-match',
    label: '商品搭配',
    children: [
      { key: 'outfit', label: '整套搭配', prompt: '请根据图片给出整套穿搭搭配方案' },
      { key: 'accessory', label: '配饰组合', prompt: '请推荐与图片商品协调的配饰组合' },
      { key: 'display', label: '场景陈列', prompt: '请给出商品场景化陈列与布景建议' },
    ],
  },
  {
    key: 'model-pose',
    label: '模特姿态',
    children: [
      { key: 'standing', label: '站姿展示', prompt: '请推荐适合该商品的模特站姿与肢体表现' },
      { key: 'walking', label: '走步动态', prompt: '请推荐走步动态姿势，突出服装垂坠与动感' },
      { key: 'closeup', label: '半身特写', prompt: '请推荐半身特写姿态，突出上身版型与细节' },
    ],
  },
  {
    key: 'model-tryon',
    label: '模特试穿',
    children: [
      { key: 'fit', label: '合身效果', prompt: '请生成模特试穿合身效果展示方案' },
      { key: 'layer', label: '叠穿展示', prompt: '请生成模特叠穿试穿效果展示方案' },
      { key: 'compare', label: '尺码对比', prompt: '请给出不同尺码试穿对比展示建议' },
    ],
  },
  {
    key: 'digital-model',
    label: '数字人模特',
    children: [
      { key: 'avatar', label: '虚拟形象', prompt: '请推荐适合该商品的数字人虚拟形象设定' },
      { key: 'motion', label: '动作演绎', prompt: '请设计数字人模特动作演绎脚本' },
      { key: 'scene', label: '场景融合', prompt: '请给出数字人模特与商品场景融合方案' },
    ],
  },
] as const

export const IMAGE_DESIGN_WORKFLOW_TITLE = '工作流'
export const IMAGE_DESIGN_WORKFLOW_MENU = [
  {
    key: 'idea',
    label: '商品实拍',
    children: [
      { key: '3d', label: '服装立体3D图', prompt: '请根据图片分析设计灵感，给出可落地的创意方向' },
      { key: 'flat', label: '服装平铺图', prompt: '请根据图片提炼整体风格，并说明适用场景与人群' },
      { key: 'detail', label: '服装细节图', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
      { key: 'fabric', label: '服装面料图', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
      { key: '360', label: '商品360°', prompt: '请生成商品360°展示方案，覆盖多角度呈现需求' },
    ],
  },
  {
    key: 'product-caption',
    label: '种草图',
    children: [
      { key: 'concept', label: '服装立体3D图', prompt: '请根据图片分析设计灵感，给出可落地的创意方向' },
      { key: 'color', label: '服装细节图', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
      { key: 'color', label: '服装面料图', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
      { key: 'color', label: '详情页图', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
    ],
  },
  {
    key: 'model-pose',
    label: '模特姿势',
    children: [
      { key: 'front', label: '正面全身', prompt: '请根据图片分析设计灵感，给出可落地的创意方向' },
      { key: 'back', label: '背面全身', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
      { key: 'color', label: '侧面45度', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
      { key: 'random', label: '随机姿势', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
    ],
  },
  {
    key: 'model-tryon',
    label: '模特试穿',
    children: [
      { key: 'female', label: '随机女性', prompt: '请根据图片分析设计灵感，给出可落地的创意方向' },
      { key: 'male', label: '随机男性', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
      { key: 'child', label: '随机童模', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
      { key: 'my', label: '我的模特', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
    ],
  },
  {
    key: 'digital-model',
    label: '数字人模特',
    children: [
      { key: 'female', label: '图生数字人', prompt: '请根据图片分析设计灵感，给出可落地的创意方向' },
      { key: 'face', label: '模特换脸', prompt: '请根据图片给出主色、辅色与点缀色搭配建议' },
    ],
  },
] as const

export type CanvasProjectItem = {
  id: string
  name: string
  saved: boolean
}

export const CANVAS_PROJECTS: CanvasProjectItem[] = [
  { id: 'draft-1', name: '未命名创作', saved: true },
  { id: 'draft-2', name: '未命名创作1', saved: false },
]

export const VIDEO_DIALOGUE_GREETING = 'Hi, 我是你的AI设计助理'
export const VIDEO_DIALOGUE_PLACEHOLDER = '让我们开始创作吧...'
export const VIDEO_DIALOGUE_VIDEO_SETTINGS = '5s · 16:9 · 720P'
export const VIDEO_DIALOGUE_CREDITS = '135'

export const VIDEO_GEN_DURATION_LABEL = '时长'
export const VIDEO_GEN_ASPECT_RATIO_LABEL = '宽高比'
export const VIDEO_GEN_RESOLUTION_LABEL = '分辨率'
export const VIDEO_GEN_DURATIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const
export type VideoGenDuration = (typeof VIDEO_GEN_DURATIONS)[number]
export const VIDEO_GEN_ASPECT_RATIOS = [
  { key: '16:9', label: '16:9', preview: { width: 16, height: 9 } },
  { key: '9:16', label: '9:16', preview: { width: 9, height: 16 } },
  { key: '1:1', label: '1:1', preview: { width: 12, height: 12 } },
  { key: '4:3', label: '4:3', preview: { width: 14, height: 10 } },
  { key: '3:4', label: '3:4', preview: { width: 10, height: 14 } },
] as const
export type VideoGenAspectRatio = (typeof VIDEO_GEN_ASPECT_RATIOS)[number]['key']
export const VIDEO_GEN_RESOLUTIONS = ['720P', '1080P'] as const
export type VideoGenResolution = (typeof VIDEO_GEN_RESOLUTIONS)[number]

export function formatVideoGenSettings(
  duration: VideoGenDuration,
  aspectRatio: VideoGenAspectRatio,
  resolution: VideoGenResolution,
) {
  return `${duration}s · ${aspectRatio} · ${resolution}`
}

export const VIDEO_ADVISOR_MENU = [
  {
    key: 'dynamic',
    label: '动态呈现',
    children: [
      { key: 'product', label: '产品细节' },
      { key: 'tvc', label: 'TVC展示' },
      { key: 'fpv', label: 'FPV运镜' },
      { key: 'clothing', label: '服装展示' },
    ],
  },
  {
    key: 'voiceover',
    label: '口播配音',
    children: [
      { key: 'intro', label: '产品介绍' },
      { key: 'promo', label: '促销口播' },
      { key: 'story', label: '故事叙述' },
    ],
  },
  {
    key: 'camera',
    label: '运镜方式',
    children: [
      { key: 'push', label: '推镜头' },
      { key: 'orbit', label: '环绕运镜' },
      { key: 'follow', label: '跟随运镜' },
    ],
  },
] as const

export const VIDEO_STORYBOARD_TITLE = '生成分镜版图'
export const VIDEO_STORYBOARD_DURATION_LABEL = '视频时长'
export const VIDEO_STORYBOARD_DURATIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const
export type VideoStoryboardDuration = (typeof VIDEO_STORYBOARD_DURATIONS)[number]
export const VIDEO_STORYBOARD_DESC_LABEL = '补充描述（选填）'
export const VIDEO_STORYBOARD_DESC_PLACEHOLDER = '请输入分镜板视频补充要求...'
export const VIDEO_STORYBOARD_RATIOS = ['16:9', '9:16', '1:1'] as const
export type VideoStoryboardRatio = (typeof VIDEO_STORYBOARD_RATIOS)[number]

export const VIDEO_HD_TITLE = '视频高清'
export const VIDEO_HD_MAGNIFICATION_LABEL = '放大倍数'
export const VIDEO_HD_MAGNIFICATIONS = ['1', '2', '4'] as const
export type VideoHdMagnification = (typeof VIDEO_HD_MAGNIFICATIONS)[number]
export const VIDEO_HD_HINT =
  '预计消费较多积分(20积分每秒，约1元每秒)，10秒视频约请求耗时5分钟。'

export const IMAGE_HD_RESOLUTIONS = ['2K', '4K', '8K'] as const

export const IMAGE_CUTOUT_MODES = ['快速', '精准', '擦除'] as const

export const IMAGE_CROP_ASPECT_RATIOS = [
  { key: 'free', label: '自由裁剪', ratio: null },
  { key: 'original', label: '原图比例', ratio: 'original' as const },
  { key: '1:1', label: '1:1', ratio: 1 },
  { key: '4:3', label: '4:3', ratio: 4 / 3 },
  { key: '3:4', label: '3:4', ratio: 3 / 4 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
  { key: '9:16', label: '9:16', ratio: 9 / 16 },
  { key: '3:2', label: '3:2', ratio: 3 / 2 },
  { key: '2:3', label: '2:3', ratio: 2 / 3 },
] as const

export type ImageCropAspectKey = (typeof IMAGE_CROP_ASPECT_RATIOS)[number]['key']

export type ImageToolbarHoverConfig = {
  tooltip?: string
  menu?: readonly string[]
}

export const IMAGE_TOOLBAR_MORE_HOVER: Record<string, ImageToolbarHoverConfig> = {
  split: { menu: ['4宫格', '9宫格', '自由'] },
  annotate: { tooltip: '标注' },
  decompose: { tooltip: '图层分离', menu: ['全部', '单个'] },
  erase: { tooltip: '消除', menu: ['智能', '快速'] },
  search: { tooltip: '搜同款', menu: ['同款', '类似'] },
  parse: { tooltip: '解析' },
}

export function getImageToolbarMoreHover(key: string) {
  return IMAGE_TOOLBAR_MORE_HOVER[key]
}

export const PROMPT_PLACEHOLDER =
  '写下你想讲的故事、场景或角色设定，例如：一个来自未来的机器人，在城市屋顶看星星。'

const NODE_CARD = nodeCardSize2x3()

export const NODE_SIZE = {
  text: { picker: { ...NODE_CARD }, editor: { width: 320, height: 220 } },
  image: {
    landscape: { ...NODE_CARD },
    portrait: { ...NODE_CARD },
    genPicker: { ...NODE_CARD },
    /** 图生图节点仅保留预览区，输入框在节点下方浮层 */
    img2img: { width: 300, height: 240 },
    hd: { width: 300, height: 360 },
  },
  video: {
    picker: { ...NODE_CARD },
    /** 未上传视频时与文本/图片卡片同尺寸 */
    landscape: { ...NODE_CARD },
    /** 已上传视频按 2:3 展示，宽 180 */
    media: { ...NODE_CARD },
  },
  audio: { picker: { ...NODE_CARD }, editor: { width: 320, height: 220 } },
}

export const KIND_LABEL: Record<NodeKind, string> = {
  text: '文本节点',
  image: '图片节点',
  video: '视频节点',
  audio: '音频节点',
}

export function formatDimensions(width: number, height: number) {
  if (!width || !height) return ''
  return `${width} × ${height}`
}

export function isPortrait(width: number, height: number) {
  return height > width
}
