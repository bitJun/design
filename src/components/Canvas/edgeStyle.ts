import type { Edge, Graph } from '@antv/x6'

/** 画布连线主色（电流输出效果） */
export const FLOW_EDGE_COLOR = '#6b7cff'

const FLOW_EDGE_DASH = '12 7'

export function getFlowEdgeLineAttrs(stroke = FLOW_EDGE_COLOR) {
  return {
    stroke,
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeDasharray: FLOW_EDGE_DASH,
    targetMarker: {
      name: 'block' as const,
      width: 10,
      height: 8,
      fill: stroke,
      stroke,
    },
  }
}

export function getFlowEdgeAttrs(stroke = FLOW_EDGE_COLOR) {
  return { line: getFlowEdgeLineAttrs(stroke) }
}

export function applyFlowEdgeStyle(edge: Edge, stroke = FLOW_EDGE_COLOR) {
  edge.setAttrs(getFlowEdgeAttrs(stroke))
}

export function bindFlowEdgeInteraction(graph: Graph) {
  graph.on('edge:added', ({ edge }) => {
    applyFlowEdgeStyle(edge as Edge)
  })
}
