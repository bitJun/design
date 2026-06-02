import type { Graph } from '@antv/x6'

export type CanvasBgTheme = 'dark' | 'light'

export interface CanvasBgThemeMeta {
  label: string
  pageBg: string
  graphBg: string
  gridColor: string
  edgeStroke: string
  minimapBg: string
}

const CANVAS_BG_THEMES: Record<CanvasBgTheme, CanvasBgThemeMeta> = {
  dark: {
    label: '深色',
    pageBg: '#141416',
    graphBg: '#141416',
    gridColor: '#2a2a30',
    edgeStroke: '#e5e7eb',
    minimapBg: '#1a1a1e',
  },
  light: {
    label: '灰色',
    pageBg: '#e8eaed',
    graphBg: '#e8eaed',
    gridColor: '#b8bcc4',
    edgeStroke: '#6b7280',
    minimapBg: '#e8eaed',
  },
}

export function getCanvasBgThemeMeta(theme: CanvasBgTheme): CanvasBgThemeMeta {
  return CANVAS_BG_THEMES[theme]
}

let defaultEdgeStroke = CANVAS_BG_THEMES.dark.edgeStroke

export function getDefaultEdgeStroke() {
  return defaultEdgeStroke
}

export function syncGraphThemeDefaults(theme: CanvasBgTheme) {
  defaultEdgeStroke = getCanvasBgThemeMeta(theme).edgeStroke
}

export function applyCanvasBgTheme(
  graph: Graph | null,
  theme: CanvasBgTheme,
  gridVisible = true,
) {
  syncGraphThemeDefaults(theme)
  if (!graph) return

  const meta = getCanvasBgThemeMeta(theme)
  graph.background.draw({ color: meta.graphBg })

  if (gridVisible) {
    graph.setGridSize(16)
    graph.drawGrid({
      type: 'dot',
      args: { color: meta.gridColor, thickness: 1.2 },
    })
    graph.showGrid()
  }

  graph.getEdges().forEach((edge) => {
    edge.setAttrByPath('line/stroke', meta.edgeStroke)
  })
}
