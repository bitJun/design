import { inject } from 'vue'
import type { Node } from '@antv/x6'
import type { CanvasGraph } from '../graph'

export function useNodeDelete() {
  const getNode = inject<() => Node>('getNode')!

  function removeSelf() {
    const graph = getNode().model?.graph as CanvasGraph | undefined
    graph?.__deleteCanvasNode?.(getNode().id)
  }

  return { removeSelf }
}
