import type { Graph, Node } from '@antv/x6'
import type { CanvasNodeData } from './constants'
import { connectGenEdge } from './imageGen'

export const IMG2PROMPT_DEFAULT_INSTRUCTION =
  '根据图片生成结构化中文提示词，包括主体描述、环境、光影、镜头语言、风格关键词。'

export function findLinkedImageNode(graph: Graph, textNodeId: string): Node | null {
  for (const edge of graph.getEdges()) {
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    if (!sourceId || !targetId) continue

    let imageId = ''
    let textId = ''
    if (sourceId === textNodeId) {
      textId = sourceId
      imageId = targetId
    } else if (targetId === textNodeId) {
      textId = targetId
      imageId = sourceId
    } else {
      continue
    }

    const imageCell = graph.getCellById(imageId)
    if (!imageCell?.isNode()) continue
    const data = imageCell.getData() as CanvasNodeData
    if (data.kind !== 'image' || !data.previewUrl) continue
    if (textId !== textNodeId) continue
    return imageCell as Node
  }
  return null
}

export const findIncomingImageNode = findLinkedImageNode

export function syncTextNodeImageSource(
  graph: Graph,
  textNode: Node,
  imageNode?: Node | null,
): CanvasNodeData {
  const linked = imageNode ?? findLinkedImageNode(graph, textNode.id)
  const data = { ...(textNode.getData() as CanvasNodeData) }

  if (linked) {
    const imageData = linked.getData() as CanvasNodeData
    data.linkedImageNodeId = linked.id
    data.sourcePreviewUrl = imageData.previewUrl
    data.sourceFileName = imageData.fileName
    textNode.setData(data)
  }

  return textNode.getData() as CanvasNodeData
}

export function syncTextNodesFromImageSource(graph: Graph, imageNode: Node) {
  graph.getNodes().forEach((node) => {
    const data = node.getData() as CanvasNodeData
    if (data.kind !== 'text') return
    if (
      data.linkedImageNodeId === imageNode.id ||
      findLinkedImageNode(graph, node.id)?.id === imageNode.id
    ) {
      syncTextNodeImageSource(graph, node, imageNode)
    }
  })
}

export function mockImg2Prompt(
  instruction: string,
  source: {
    previewUrl?: string
    fileName?: string
    mediaWidth?: number
    mediaHeight?: number
  },
): Promise<string> {
  void instruction
  void source
  const body = [
    '主体描述：画面主体清晰突出，造型完整、细节丰富，材质纹理与光泽质感真实，整体层次分明。',
    '环境：背景空间层次清晰，元素布局协调，色调统一，营造出契合主体的氛围与景深。',
    '光影：自然光照明，明暗对比柔和，高光与阴影过渡自然，立体感与质感表现到位。',
    '镜头语言：中景构图，主体居中，视角平稳，景深适中，画面比例均衡。',
    '风格关键词：写实、电影感、高质感、色彩统一、画面精致。',
  ].join('\n')

  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(body)
    }, 2600)
  })
}

export async function runImg2Prompt(
  graph: Graph,
  textNode: Node,
  instruction = IMG2PROMPT_DEFAULT_INSTRUCTION,
): Promise<string> {
  const imageNode = findLinkedImageNode(graph, textNode.id)
  if (!imageNode) {
    throw new Error('请先连接一张图片节点')
  }

  syncTextNodeImageSource(graph, textNode, imageNode)

  const data = { ...(textNode.getData() as CanvasNodeData) }
  data.textGenState = 'loading'
  textNode.setData(data)

  const imageData = imageNode.getData() as CanvasNodeData
  const prompt = await mockImg2Prompt(instruction, {
    previewUrl: imageData.previewUrl,
    fileName: imageData.fileName,
    mediaWidth: imageData.mediaWidth,
    mediaHeight: imageData.mediaHeight,
  })

  const next = { ...(textNode.getData() as CanvasNodeData) }
  next.textGenState = 'done'
  next.content = prompt
  next.mode = 'editor'
  next.textPickerTask = ''
  textNode.setData(next)
  return prompt
}

export function ensureImageTextEdge(graph: Graph, imageNodeId: string, textNodeId: string) {
  const exists = graph.getEdges().some((edge) => {
    const s = edge.getSourceCellId()
    const t = edge.getTargetCellId()
    return (
      (s === imageNodeId && t === textNodeId) ||
      (s === textNodeId && t === imageNodeId)
    )
  })
  if (!exists) {
    connectGenEdge(graph, imageNodeId, textNodeId)
  }
}
