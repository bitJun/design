import { inject } from 'vue'
import type { Node } from '@antv/x6'

export function useNodeConnect() {
  const getNode = inject<() => Node>('getNode')!
  const connectFromNode = inject<(nodeId: string) => void>('connectFromNode')

  function onPlusClick() {
    connectFromNode?.(getNode().id)
  }

  return { onPlusClick }
}
