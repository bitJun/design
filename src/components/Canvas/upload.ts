import type { Graph, Node } from '@antv/x6'
import type { CanvasNodeData } from './constants'
import { syncGenNodesFromSource } from './imageGen'
import { getNodeSize } from './graph'

export function runUploadSimulation(graphNode: Node, file: File) {
  const data = { ...(graphNode.getData() as CanvasNodeData) }
  data.uploadState = 'uploading'
  data.uploadProgress = 0
  data.fileName = file.name
  data.mode = 'editor'
  graphNode.setData(data)

  const duration = file.size > 8_000_000 ? 3200 : file.type.startsWith('video/') ? 2400 : 1600
  const start = Date.now()

  const timer = window.setInterval(() => {
    const elapsed = Date.now() - start
    const progress = Math.min(100, Math.round((elapsed / duration) * 100))
    const current = { ...(graphNode.getData() as CanvasNodeData) }
    current.uploadProgress = progress
    graphNode.setData(current)

    if (progress >= 100) {
      window.clearInterval(timer)
      finishUpload(graphNode, file)
    }
  }, 60)
}

function finishUpload(graphNode: Node, file: File) {
  const url = URL.createObjectURL(file)
  const data = { ...(graphNode.getData() as CanvasNodeData) }
  data.uploadState = 'done'
  data.uploadProgress = 100
  data.previewUrl = url
  data.mode = 'editor'

  if (file.type.startsWith('image/')) {
    const img = new Image()
    img.onload = () => {
      data.mediaWidth = img.naturalWidth
      data.mediaHeight = img.naturalHeight
      applyNodeMedia(graphNode, data)
    }
    img.src = url
    return
  }

  data.mediaWidth = 2560
  data.mediaHeight = 1440
  applyNodeMedia(graphNode, data)
}

function applyNodeMedia(graphNode: Node, data: CanvasNodeData) {
  graphNode.setData(data)
  const size = getNodeSize(data.kind, data.mode, data)
  graphNode.resize(size.width, size.height)

  const graph = graphNode.model?.graph as Graph | undefined
  if (graph && !data.imageGenTask) {
    syncGenNodesFromSource(graph, graphNode)
  }
}
