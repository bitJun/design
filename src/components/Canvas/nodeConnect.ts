import type { Graph, Node } from '@antv/x6'
import type { CanvasNodeData, ConnectMenuKey, NodeKind } from './constants'
import {
  connectGenEdge,
  spawnImageGenNode,
  spawnImageGenNodeAtPoint,
  spawnText2ImgNode,
} from './imageGen'
import { addCanvasNode, graphLocalToContainerOffset } from './graph'

export const CONNECT_MENU_WIDTH = 200
export const CONNECT_MENU_HEIGHT = 360

export function canOpenConnectMenu(node: Node) {
  const data = node.getData() as CanvasNodeData
  if (data.imageGenTask === 'img2img' || data.imageGenTask === 'hd') return true
  if (data.imageGenTask === 'picker') return true
  if (data.kind === 'image' && !data.imageGenTask) return true
  if (data.kind === 'video' || data.kind === 'text' || data.kind === 'audio') return true
  return false
}

/** @deprecated 使用操作组选择后创建 */
export function canSpawnFromPlus(node: Node) {
  return canOpenConnectMenu(node)
}

export function getConnectPreviewStroke(node: Node) {
  return canOpenConnectMenu(node) ? '#6b7cff' : null
}

function buildSourceRef(sourceNode: Node, sourceData: CanvasNodeData): Partial<CanvasNodeData> {
  return {
    sourceNodeId: sourceNode.id,
    sourcePreviewUrl: sourceData.previewUrl ?? '',
    sourceFileName: sourceData.fileName ?? '',
    inputUpdated: Boolean(sourceData.previewUrl),
  }
}

function spawnLinkedNode(
  graph: Graph,
  sourceNode: Node,
  point: { x: number; y: number },
  kind: NodeKind,
  overrides: Partial<CanvasNodeData> = {},
) {
  const sourceData = sourceNode.getData() as CanvasNodeData
  const node = addCanvasNode(graph, kind, point, {
    ...buildSourceRef(sourceNode, sourceData),
    ...overrides,
  })
  connectGenEdge(graph, sourceNode.id, node.id)
  return node
}

export function createNodeFromConnectMenu(
  graph: Graph,
  sourceNode: Node,
  point: { x: number; y: number },
  menuKey: ConnectMenuKey,
) {
  const sourceData = sourceNode.getData() as CanvasNodeData

  switch (menuKey) {
    case 'text':
      return spawnLinkedNode(graph, sourceNode, point, 'text', { mode: 'picker' })
    case 'image':
      if (sourceData.kind === 'image' && !sourceData.imageGenTask) {
        return spawnImageGenNodeAtPoint(graph, sourceNode, point)
      }
      return spawnText2ImgNode(graph, sourceNode, point)
    case 'video':
      return spawnLinkedNode(graph, sourceNode, point, 'video', { mode: 'picker' })
    case 'compose':
      return spawnLinkedNode(graph, sourceNode, point, 'video', {
        mode: 'picker',
        title: '视频合成',
      })
    case 'director':
      return spawnLinkedNode(graph, sourceNode, point, 'text', {
        mode: 'picker',
        title: '导演台',
      })
    case 'audio':
      return spawnLinkedNode(graph, sourceNode, point, 'audio', { mode: 'picker' })
    case 'script':
      return spawnLinkedNode(graph, sourceNode, point, 'text', {
        mode: 'picker',
        title: '脚本',
      })
    case 'reference':
      return null
    default:
      return null
  }
}

/** 点击节点 + 时，在默认位置打开菜单（与拖线落点菜单一致） */
export function getDefaultConnectPoint(sourceNode: Node) {
  const bbox = sourceNode.getBBox()
  const gap = 56
  return {
    x: bbox.x + bbox.width + gap,
    y: bbox.y + bbox.height / 2,
  }
}

export function getConnectSourceAnchor(sourceNode: Node) {
  const bbox = sourceNode.getBBox()
  return {
    x: bbox.x + bbox.width,
    y: bbox.y + bbox.height / 2,
  }
}

/** 新节点落在源节点与松手落点之间的中点 */
export function getConnectDropPoint(
  sourceNode: Node,
  releasePoint: { x: number; y: number },
) {
  const anchor = getConnectSourceAnchor(sourceNode)
  return {
    x: (anchor.x + releasePoint.x) / 2,
    y: (anchor.y + releasePoint.y) / 2,
  }
}

/** 引用节点生成菜单：左上角对齐松手落点（连线接到菜单左上角） */
export function getConnectMenuPosition(
  graph: Graph,
  sourceNode: Node,
  container: HTMLElement,
  releasePoint: { x: number; y: number },
) {
  const offset = graphLocalToContainerOffset(
    graph,
    releasePoint.x,
    releasePoint.y,
    container,
  )
  const rect = container.getBoundingClientRect()

  return {
    left: Math.max(
      12,
      Math.min(offset.left, rect.width - CONNECT_MENU_WIDTH - 12),
    ),
    top: Math.max(
      60,
      Math.min(offset.top, rect.height - CONNECT_MENU_HEIGHT - 12),
    ),
    dropPoint: getConnectDropPoint(sourceNode, releasePoint),
  }
}

/** 清理源节点上未连接到目标的预览连线，保证同时只有一条 */
export function removeSourcePreviewEdges(graph: Graph, sourceId: string, keepEdgeId?: string) {
  graph.getEdges().forEach((edge) => {
    if (edge.id === keepEdgeId) return
    if (edge.getSourceCellId() !== sourceId) return
    const target = edge.getTarget()
    if (target && typeof target === 'object' && 'cell' in target && target.cell) return
    graph.removeEdge(edge.id)
  })
}

export function handlePlusConnect(graph: Graph, sourceNode: Node) {
  if (!canOpenConnectMenu(sourceNode)) return null
  const sourceData = sourceNode.getData() as CanvasNodeData
  if (sourceData.kind === 'image' && !sourceData.imageGenTask) {
    return spawnImageGenNode(graph, sourceNode, 'picker')
  }
  if (sourceData.kind === 'video' && sourceData.mode === 'editor') {
    return spawnLinkedNode(graph, sourceNode, getDefaultConnectPoint(sourceNode), 'video', {
      mode: 'picker',
    })
  }
  return null
}
