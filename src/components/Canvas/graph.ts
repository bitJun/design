import { Graph, Shape, type Node } from '@antv/x6'
import { Scroller } from '@antv/x6-plugin-scroller'
import '@antv/x6-plugin-scroller/es/index.css'
import { register } from '@antv/x6-vue-shape'
import { getDefaultEdgeStroke } from './canvasTheme'
import { canOpenConnectMenu, getConnectPreviewStroke } from './nodeConnect'
import '@antv/x6-vue-shape'
import TextNode from './nodes/TextNode.vue'
import ImageNode from './nodes/ImageNode.vue'
import ImageGenNode from './nodes/ImageGenNode.vue'
import VideoNode from './nodes/VideoNode.vue'
import {
  createEmptyNodeData,
  IMAGE_NODE_META_HEIGHT,
  KIND_LABEL,
  NODE_SIZE,
  type CanvasNodeData,
  type NodeKind,
  type NodeMode,
  isPortrait,
} from './constants'

type ScrollerImplLike = {
  localToBackgroundPoint(x: number, y: number): { x: number; y: number }
  container: HTMLDivElement
}

/** 将图坐标转换为相对 canvas 容器的像素偏移（兼容 Scroller 滚动/缩放） */
export function graphLocalToContainerOffset(
  graph: Graph,
  localX: number,
  localY: number,
  container: HTMLElement,
) {
  const scroller = getScroller(graph)
  const containerRect = container.getBoundingClientRect()
  const scrollerImpl = scroller
    ? (scroller as unknown as { scrollerImpl?: ScrollerImplLike }).scrollerImpl
    : undefined

  if (scroller && scrollerImpl) {
    const bg = scrollerImpl.localToBackgroundPoint(localX, localY)
    const scrollEl = scroller.container
    const scrollRect = scrollEl.getBoundingClientRect()
    return {
      left: bg.x - scrollEl.scrollLeft + (scrollRect.left - containerRect.left),
      top: bg.y - scrollEl.scrollTop + (scrollRect.top - containerRect.top),
    }
  }

  const client = graph.localToClient(localX, localY)
  return {
    left: client.x - containerRect.left,
    top: client.y - containerRect.top,
  }
}

export type ConnectMenuOpener = (nodeId: string, point: { x: number; y: number }) => void

export type CanvasGraph = Graph & {
  __scroller?: Scroller
  __openConnectMenu?: ConnectMenuOpener
  __suppressBlankCloseForConnect?: boolean
  __connectPreviewEdgeId?: string
}

let shapesRegistered = false

const counters: Record<NodeKind, number> = {
  text: 0,
  image: 0,
  video: 0,
  audio: 0,
}

export function registerShapes() {
  if (shapesRegistered) return
  shapesRegistered = true

  register({ shape: 'text-node', width: 280, height: 300, component: TextNode })
  register({ shape: 'image-node', width: 300, height: 360, component: ImageNode })
  register({ shape: 'image-gen-node', width: 300, height: 340, component: ImageGenNode })
  register({ shape: 'video-node', width: 300, height: 340, component: VideoNode })
}

export function createDefaultNodeData(kind: NodeKind): CanvasNodeData {
  counters[kind] += 1
  const base = createEmptyNodeData()
  return {
    ...base,
    kind,
    title: `${KIND_LABEL[kind]} ${counters[kind]}`,
    mode: kind === 'text' || kind === 'audio' || kind === 'video' ? 'picker' : 'editor',
  }
}

export function getNodeShape(kind: NodeKind, data?: Partial<CanvasNodeData>) {
  if (kind === 'text' || kind === 'audio') return 'text-node'
  if (kind === 'video') return 'video-node'
  if (kind === 'image' && data?.imageGenTask) return 'image-gen-node'
  return 'image-node'
}

export function getBaseNodeSize(
  kind: NodeKind,
  mode: NodeMode = 'picker',
  data?: Partial<CanvasNodeData>,
) {
  const w = data?.mediaWidth ?? 0
  const h = data?.mediaHeight ?? 0

  if (kind === 'text' || kind === 'audio') {
    return mode === 'editor' ? NODE_SIZE.text.editor : NODE_SIZE.text.picker
  }
  if (kind === 'video') {
    if (mode === 'picker') return NODE_SIZE.video.picker
    return NODE_SIZE.video.landscape
  }
  if (kind === 'image') {
    if (data?.imageGenTask === 'picker') return NODE_SIZE.image.genPicker
    if (data?.imageGenTask === 'img2img') return NODE_SIZE.image.img2img
    if (data?.imageGenTask === 'hd') return NODE_SIZE.image.hd
    if (w && h && isPortrait(w, h)) return NODE_SIZE.image.portrait
    return NODE_SIZE.image.landscape
  }
  return NODE_SIZE.image.landscape
}

export function getNodeSize(
  kind: NodeKind,
  mode: NodeMode = 'picker',
  data?: Partial<CanvasNodeData>,
) {
  const base = getBaseNodeSize(kind, mode, data)
  const scale = data?.viewScale ?? 1
  if (scale === 1) return base

  return {
    width: Math.max(120, Math.round(base.width * scale)),
    height: Math.max(120, Math.round(base.height * scale)),
  }
}

export function createPorts(stroke = '#8b8b95') {
  return {
    groups: {
      left: {
        position: { name: 'left' },
        attrs: {
          circle: {
            r: 12,
            magnet: false,
            stroke,
            strokeWidth: 1.5,
            fill: '#2a2a30',
            cursor: 'crosshair',
            style: { visibility: 'hidden' },
          },
          plus: {
            text: '+',
            fontSize: 14,
            fill: '#d1d5db',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            pointerEvents: 'none',
            style: { visibility: 'hidden' },
          },
        },
        markup: [
          { tagName: 'circle', selector: 'circle' },
          { tagName: 'text', selector: 'plus' },
        ],
      },
      right: {
        position: { name: 'right' },
        attrs: {
          circle: {
            r: 12,
            magnet: false,
            stroke,
            strokeWidth: 1.5,
            fill: '#2a2a30',
            cursor: 'crosshair',
            style: { visibility: 'hidden' },
          },
          plus: {
            text: '+',
            fontSize: 14,
            fill: '#d1d5db',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            pointerEvents: 'none',
            style: { visibility: 'hidden' },
          },
        },
        markup: [
          { tagName: 'circle', selector: 'circle' },
          { tagName: 'text', selector: 'plus' },
        ],
      },
    },
    items: [
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  }
}

export function setPortsVisible(node: Node, visible: boolean) {
  const visibility = visible ? 'visible' : 'hidden'
  node.getPorts().forEach((port) => {
    if (!port.id) return
    node.setPortProp(port.id, 'attrs/circle/style/visibility', visibility)
    node.setPortProp(port.id, 'attrs/plus/style/visibility', visibility)
  })
}

export function getScroller(graph: Graph): Scroller | null {
  return graph.getPlugin<Scroller>('scroller') ?? null
}

export function createGraph(container: HTMLElement): CanvasGraph {
  registerShapes()

  const graph = new Graph({
    container,
    autoResize: true,
    background: { color: '#141416' },
    grid: {
      visible: true,
      size: 16,
      type: 'dot',
      args: { color: '#2a2a30', thickness: 1.2 },
    },
    panning: false,
    clickThreshold: 5,
    mousewheel: {
      enabled: true,
      modifiers: null,
      factor: 1.08,
      minScale: 0.35,
      maxScale: 2.5,
      zoomAtMousePosition: true,
    },
    interacting: {
      nodeMovable: true,
      edgeMovable: true,
      magnetConnectable: true,
    },
    connecting: {
      snap: true,
      allowBlank: (args) => {
        const source = args.sourceCell
        if (!source?.isNode()) return false
        return canOpenConnectMenu(source)
      },
      allowLoop: false,
      allowMulti: false,
      highlight: true,
      connector: { name: 'smooth' },
      connectionPoint: 'boundary',
      router: { name: 'normal' },
      createEdge(this: Graph, args) {
        const source = args?.sourceCell
        const previewStroke = source?.isNode() ? getConnectPreviewStroke(source) : null
        const stroke = previewStroke ?? getDefaultEdgeStroke()

        return new Shape.Edge({
          attrs: {
            line: {
              stroke,
              strokeWidth: 2,
              targetMarker: { name: 'block', width: 10, height: 8 },
            },
          },
          zIndex: 0,
        })
      },
      validateConnection({ sourceCell, targetCell }) {
        if (!sourceCell || !targetCell) return false
        return sourceCell.id !== targetCell.id
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: { attrs: { fill: '#6b7cff', stroke: '#6b7cff' } },
      },
    },
  }) as CanvasGraph

  const scroller = new Scroller({
    enabled: true,
    pannable: true,
    pageVisible: false,
    pageBreak: false,
    autoResize: true,
    padding: { top: 80, bottom: 80, left: 120, right: 120 },
  })

  graph.use(scroller)
  graph.__scroller = scroller

  return graph
}

export function addCanvasNode(
  graph: Graph,
  kind: NodeKind,
  point: { x: number; y: number },
  overrides: Partial<CanvasNodeData> = {},
) {
  const data = { ...createDefaultNodeData(kind), ...overrides }
  const size = getNodeSize(kind, data.mode, data)
  const shape = getNodeShape(kind, data)

  return graph.addNode({
    shape,
    x: point.x - size.width / 2,
    y: point.y - size.height / 2,
    width: size.width,
    height: size.height,
    ports: createPorts('#6b7280'),
    data,
  })
}

export function bindGraphInteraction(graph: Graph) {
  graph.on('node:change:data', ({ node }) => {
    const data = node.getData() as CanvasNodeData
    const size = getNodeSize(data.kind, data.mode, data)
    node.resize(size.width, size.height)
  })

  graph.on('node:added', () => {
    getScroller(graph)?.resize()
  })

  graph.on('node:removed', () => {
    getScroller(graph)?.resize()
  })
}

function getNodeToolbarAnchorY(node: Node) {
  const bbox = node.getBBox()
  const data = node.getData() as CanvasNodeData
  if (data.kind === 'image' && data.mode === 'editor' && !data.imageGenTask) {
    return bbox.y + IMAGE_NODE_META_HEIGHT
  }
  return bbox.y
}

export function getNodeToolbarPosition(graph: Graph, node: Node, container: HTMLElement) {
  const bbox = node.getBBox()
  const anchorY = getNodeToolbarAnchorY(node)
  const topCenter = graphLocalToContainerOffset(
    graph,
    bbox.x + bbox.width / 2,
    anchorY,
    container,
  )
  return {
    left: topCenter.left,
    top: topCenter.top - 8,
  }
}

export function getNodeDialoguePosition(graph: Graph, node: Node, container: HTMLElement) {
  const bbox = node.getBBox()
  const bottomY = bbox.y + bbox.height
  const bottomCenter = graphLocalToContainerOffset(
    graph,
    bbox.x + bbox.width / 2,
    bottomY,
    container,
  )
  const bottomLeft = graphLocalToContainerOffset(graph, bbox.x, bottomY, container)
  const bottomRight = graphLocalToContainerOffset(graph, bbox.x + bbox.width, bottomY, container)
  const width = Math.abs(bottomRight.left - bottomLeft.left)

  return {
    left: bottomCenter.left,
    top: bottomCenter.top + 12,
    width: Math.max(width, 360),
  }
}

export function getNodeSidePanelPosition(
  graph: Graph,
  node: Node,
  container: HTMLElement,
  panelWidth = 320,
  panelHeight = 260,
) {
  const bbox = node.getBBox()
  const topRight = graphLocalToContainerOffset(graph, bbox.x + bbox.width, bbox.y, container)
  const rect = container.getBoundingClientRect()

  return {
    left: Math.max(12, Math.min(topRight.left + 16, rect.width - panelWidth - 12)),
    top: Math.max(60, Math.min(topRight.top, rect.height - panelHeight - 12)),
    width: panelWidth,
  }
}

export function getNodeCropOverlayPosition(
  graph: Graph,
  node: Node,
  container: HTMLElement,
  minWidth = 520,
  minHeight = 420,
) {
  const bbox = node.getBBox()
  const topLeft = graphLocalToContainerOffset(graph, bbox.x, bbox.y, container)
  const bottomRight = graphLocalToContainerOffset(
    graph,
    bbox.x + bbox.width,
    bbox.y + bbox.height,
    container,
  )
  const rect = container.getBoundingClientRect()
  const nodeWidth = Math.abs(bottomRight.left - topLeft.left)
  const nodeHeight = Math.abs(bottomRight.top - topLeft.top)
  const width = Math.max(nodeWidth, minWidth)
  const height = Math.max(nodeHeight + 48, minHeight)

  return {
    left: Math.max(
      12,
      Math.min(topLeft.left - (width - nodeWidth) / 2, rect.width - width - 12),
    ),
    top: Math.max(60, Math.min(topLeft.top, rect.height - height - 12)),
    width,
    height,
  }
}
