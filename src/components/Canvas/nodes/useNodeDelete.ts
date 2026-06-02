import { inject } from 'vue'
import type { Node } from '@antv/x6'

export function useNodeDelete() {
  const getNode = inject<() => Node>('getNode')!
  const deleteCanvasNode = inject<(nodeId: string) => void>('deleteCanvasNode')

  function removeSelf() {
    deleteCanvasNode?.(getNode().id)
  }

  return { removeSelf }
}
