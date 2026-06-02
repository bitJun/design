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
  { key: 'compose', label: '视频合成', icon: 'compose', badge: 'Beta' },
  { key: 'director', label: '导演台', icon: 'director', badge: 'NEW' },
  { key: 'audio', label: '音频', icon: 'audio', disabled: true },
  { key: 'script', label: '脚本', icon: 'script', badge: 'Beta' },
  { key: 'reference', label: '参考节点', icon: 'link', disabled: true },
]

export const ADD_NODE_GROUPS = [
  {
    title: '添加节点',
    items: [
      { kind: 'text' as const, label: '文本', desc: '脚本、广告词、品牌文案', icon: 'text' as MenuIcon },
      { kind: 'image' as const, label: '图片', desc: '海报、封面、素材图', icon: 'image' as MenuIcon },
      { kind: 'video' as const, label: '视频', desc: '短视频、动画片段', icon: 'video' as MenuIcon },
      { kind: 'video' as const, label: '视频合成', desc: '多段素材合成', badge: 'Beta', icon: 'compose' as MenuIcon },
      { kind: 'text' as const, label: '导演台', desc: '镜头与分镜控制', badge: 'NEW', icon: 'director' as MenuIcon },
      { kind: 'audio' as const, label: '音频', desc: '配音、音效、背景音乐', icon: 'audio' as MenuIcon },
      { kind: 'text' as const, label: '脚本', desc: '结构化拍摄脚本', badge: 'Beta', icon: 'script' as MenuIcon },
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
  { key: 'text2music', label: '文字生音乐', icon: 'audio' },
]

export const VIDEO_PICKER_ACTIONS = [
  { key: 'frames', label: '首尾帧生成视频', icon: 'frames' },
  { key: 'first', label: '首帧生成视频', icon: 'spark' },
]

export const IMAGE_GEN_ACTIONS = [
  { key: 'img2img' as const, label: '图生图', icon: 'img2img' },
  { key: 'hd' as const, label: '图片高清', icon: 'hd' },
]

export const IMG2IMG_PROMPT_PLACEHOLDER =
  '描述你想要生成的画面内容，按/呼出指令，@引用素材'

export const IMG2IMG_QUICK_TAGS = ['风格', '相似', '参考'] as const

export const VIDEO_NODE_TOOLBAR = ['画质', '解析', '智能去字幕', '音频分离', '下载', '全屏']
export const IMAGE_NODE_TOOLBAR = ['全景', '多角度', '打光', '九宫格', '高清', '宽高比']

export const PROMPT_PLACEHOLDER =
  '写下你想讲的故事、场景或角色设定，例如：一个来自未来的机器人，在城市屋顶看星星。'

export const NODE_SIZE = {
  text: { picker: { width: 280, height: 300 }, editor: { width: 320, height: 220 } },
  image: {
    landscape: { width: 300, height: 360 },
    portrait: { width: 220, height: 400 },
    genPicker: { width: 300, height: 340 },
    img2img: { width: 360, height: 500 },
    hd: { width: 300, height: 360 },
  },
  video: {
    picker: { width: 300, height: 340 },
    landscape: { width: 480, height: 300 },
  },
  audio: { picker: { width: 280, height: 300 }, editor: { width: 320, height: 220 } },
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
