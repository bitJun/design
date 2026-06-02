import type { Graph, Node } from '@antv/x6'
import type { CanvasNodeData } from './constants'
import { GEN_EDGE_COLOR } from './imageGen'
import { getNodeSize } from './graph'

export interface ConnectGhostState {
  visible: boolean
  left: number
  top: number
  width: number
  height: number
}

export type ConnectGhostUpdater = (state: ConnectGhostState) => void

export type ConnectDropHandler = (source: Node, point: { x: number; y: number }) => void

function canStartConnect(node: Node) {
  const data = node.getData() as CanvasNodeData
  return data.kind === 'image' && !data.imageGenTask
}

export function bindPortConnectDrag(
  graph: Graph,
  container: HTMLElement,
  onGhostUpdate: ConnectGhostUpdater,
  onDrop: ConnectDropHandler,
) {
  let dragging = false
  let edgeId = ''
  let sourceNode: Node | null = null
  let ghostSize = { width: 300, height: 340 }

  const hideGhost = () => {
    onGhostUpdate({ visible: false, left: 0, top: 0, width: 0, height: 0 })
  }

  const showGhost = (clientX: number, clientY: number) => {
    const rect = container.getBoundingClientRect()
    onGhostUpdate({
      visible: true,
      left: clientX - rect.left - ghostSize.width / 2,
      top: clientY - rect.top - ghostSize.height / 2,
      width: ghostSize.width,
      height: ghostSize.height,
    })
  }

  const cleanup = () => {
    dragging = false
    sourceNode = null
    hideGhost()
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (event: MouseEvent) => {
    if (!dragging || !sourceNode || !edgeId) return
    const edge = graph.getCellById(edgeId)
    if (edge?.isEdge()) {
      const local = graph.clientToLocal(event.clientX, event.clientY)
      edge.setTarget(local)
    }
    showGhost(event.clientX, event.clientY)
  }

  const onMouseUp = (event: MouseEvent) => {
    if (!dragging || !sourceNode) {
      cleanup()
      return
    }

    const point = graph.clientToLocal(event.clientX, event.clientY)
    if (edgeId) {
      const edge = graph.getCellById(edgeId)
      if (edge?.isEdge()) graph.removeCell(edge)
    }

    onDrop(sourceNode, point)
    cleanup()
  }

  graph.on('node:port:mousedown', ({ e, node, port }) => {
    if (port !== 'right' || !canStartConnect(node)) return

    e.preventDefault()
    e.stopPropagation()

    const size = getNodeSize('image', 'picker', { imageGenTask: 'picker' })
    ghostSize = size
    sourceNode = node
    dragging = true

    const local = graph.clientToLocal(e.clientX, e.clientY)
    const edge = graph.addEdge({
      source: { cell: node.id, port: 'right' },
      target: local,
      attrs: {
        line: {
          stroke: GEN_EDGE_COLOR,
          strokeWidth: 2,
          strokeDasharray: '6 4',
          targetMarker: null,
        },
      },
      zIndex: 0,
    })
    edgeId = edge.id
    showGhost(e.clientX, e.clientY)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  })

  return () => {
    cleanup()
    if (edgeId) {
      const edge = graph.getCellById(edgeId)
      if (edge?.isEdge()) graph.removeCell(edge)
    }
  }
}
