<template>
  <div class="canvas" :class="`canvas--bg-${canvasBgTheme}`">
    <header class="canvas__header">
      <div class="canvas__brand">
        <span class="canvas__logo">LibTV</span>
        <span class="canvas__project">未命名</span>
        <button type="button" class="canvas__cloud" title="保存">☁</button>
      </div>
      <div class="canvas__header-actions">
        <button type="button" class="canvas__header-btn" title="协作">👥</button>
        <button type="button" class="canvas__header-btn" title="分享">↗</button>
        <button type="button" class="canvas__header-btn" title="通知">🔔</button>
        <button type="button" class="canvas__header-btn canvas__header-btn--primary">会员特惠</button>
        <span class="canvas__credits">20</span>
      </div>
    </header>

    <div ref="graphRef" class="canvas__graph" />

    <div
      v-if="connectGhost.visible"
      class="canvas__connect-ghost"
      :style="{
        left: `${connectGhost.left}px`,
        top: `${connectGhost.top}px`,
        width: `${connectGhost.width}px`,
        height: `${connectGhost.height}px`,
      }"
    />

    <div v-if="isEmpty" class="canvas__empty">
      <p class="canvas__hint">
        <span class="canvas__hint-icon" aria-hidden="true" />
        {{ EMPTY_HINT }}
      </p>
      <div class="canvas__templates">
        <button
          v-for="item in NODE_TEMPLATES"
          :key="item.label"
          type="button"
          class="canvas__template"
          @click="addFromTemplate(item.kind)"
        >
          <span class="canvas__template-text">
            <span class="canvas__template-label">{{ item.label }}</span>
            <span class="canvas__template-desc">{{ item.desc }}</span>
          </span>
          <span
            class="canvas__template-badge"
            :style="{ background: `${item.accent}33`, border: `1px solid ${item.accent}66` }"
          />
        </button>
      </div>
    </div>

    <div
      v-if="showNodeToolbar"
      class="canvas__node-toolbar"
      :style="{ left: `${toolbarPos.left}px`, top: `${toolbarPos.top}px` }"
      @mousedown.stop
    >
      <template v-if="showToolbarFeatureButtons">
        <button
          v-for="item in activeToolbarItems"
          :key="item"
          type="button"
          class="canvas__node-toolbar-btn"
        >
          {{ item }}
          <em v-if="item === '全景'" class="canvas__toolbar-tag">NEW</em>
        </button>
        <button type="button" class="canvas__node-toolbar-btn" title="下载">↓</button>
        <button type="button" class="canvas__node-toolbar-btn" title="全屏">⤢</button>
      </template>
      <button
        type="button"
        class="canvas__node-toolbar-btn canvas__node-toolbar-btn--danger"
        title="删除节点"
        @click="removeSelectedNode"
      >
        🗑
      </button>
    </div>

    <aside v-if="showAssetsPanel" class="canvas__assets" @mousedown.stop>
      <div class="canvas__assets-head">
        <button
          type="button"
          :class="{ 'is-active': assetsTab === 'all' }"
          @click="assetsTab = 'all'"
        >
          全部
        </button>
        <button
          type="button"
          :class="{ 'is-active': assetsTab === 'mine' }"
          @click="assetsTab = 'mine'"
        >
          我的素材
        </button>
        <button type="button" class="canvas__assets-close" @click="showAssetsPanel = false">×</button>
      </div>
      <div class="canvas__assets-body">
        <div v-if="assetsLoading" class="canvas__assets-loading">
          <span class="canvas__spinner" />
          <span>加载中...</span>
        </div>
        <p v-else class="canvas__assets-empty">暂无素材，上传后将显示在这里</p>
      </div>
    </aside>

    <div
      v-if="showPromptBar"
      class="canvas__prompt"
      @mousedown.stop
    >
      <textarea
        v-model="promptText"
        class="canvas__prompt-input"
        :placeholder="PROMPT_PLACEHOLDER"
        rows="3"
      />
      <div class="canvas__prompt-footer">
        <span class="canvas__prompt-model">GVLM 3.1</span>
        <div class="canvas__prompt-actions">
          <button type="button" class="canvas__prompt-icon" title="翻译">文</button>
          <span class="canvas__prompt-count">+ 1</span>
          <button type="button" class="canvas__prompt-send" title="发送">↑</button>
        </div>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      class="canvas__file-input"
      accept="image/*,video/*"
      @change="onFileSelected"
    />

    <div class="canvas__toolbar canvas__toolbar--left">
      <button
        type="button"
        class="canvas__tool-btn"
        :class="{ 'canvas__tool-btn--active': showAddMenu }"
        title="添加节点"
        @click="toggleAddMenu"
      >
        +
      </button>
      <button
        type="button"
        class="canvas__tool-btn"
        :class="{ 'canvas__tool-btn--active': showAssetsPanel }"
        title="我的素材"
        @click="toggleAssetsPanel"
      >
        ▤
      </button>
      <button type="button" class="canvas__tool-btn" title="节点图">⎔</button>
      <button type="button" class="canvas__tool-btn" title="历史">◷</button>
      <button type="button" class="canvas__tool-btn" title="帮助">?</button>
    </div>

    <div
      v-if="showAddMenu"
      class="canvas__add-menu"
      :class="{ 'canvas__add-menu--dock': !addMenuAtCursor }"
      :style="addMenuStyle"
      @mousedown.stop
    >
      <section v-for="group in ADD_NODE_GROUPS" :key="group.title" class="canvas__add-group">
        <h4 class="canvas__add-title">{{ group.title }}</h4>
        <button
          v-for="item in group.items"
          :key="`${group.title}-${item.label}`"
          type="button"
          class="canvas__add-item"
          @click="onMenuItem(item)"
        >
          <span class="canvas__add-icon" :data-icon="item.icon" />
          <span class="canvas__add-item-label">
            {{ item.label }}
            <em
              v-if="'badge' in item && item.badge"
              class="canvas__add-badge"
              :class="{ 'canvas__add-badge--new': item.badge === 'NEW' }"
            >
              {{ item.badge }}
            </em>
          </span>
        </button>
      </section>
    </div>

    <div class="canvas__bottom-left">
      <div
        v-show="showMinimap"
        ref="minimapContainerRef"
        class="canvas__minimap-host"
      />
      <div class="canvas__toolbar canvas__toolbar--bottom">
        <button
          type="button"
          class="canvas__tool-btn canvas__tool-btn--theme"
          @click="toggleCanvasBgTheme"
        >
          <span class="canvas__theme-icon" aria-hidden="true" />
          <span class="canvas__theme-tooltip">画布背景：{{ canvasBgThemeLabel }}</span>
        </button>
        <button
          type="button"
          class="canvas__tool-btn canvas__tool-btn--tidy"
          title="整理画布"
          @click="handleTidyCanvas"
        >
          <span class="canvas__tidy-icon" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        </button>
        <button
          type="button"
          class="canvas__tool-btn"
          :class="{ 'canvas__tool-btn--active': showMinimap }"
          title="画布小地图"
          @click="toggleMinimap"
        >
          <span class="canvas__minimap-icon" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="canvas__tool-btn"
          :class="{ 'canvas__tool-btn--active': gridVisible }"
          title="网格"
          @click="toggleGrid"
        >
          ▦
        </button>
        <button
          type="button"
          class="canvas__tool-btn"
          :class="{ 'canvas__tool-btn--active': panMode }"
          title="拖动画布"
          @click="togglePanMode"
        >
          ✋
        </button>
        <div class="canvas__zoom">
          <button type="button" class="canvas__tool-btn" title="缩小" @click="zoomOut">−</button>
          <span class="canvas__zoom-value">{{ zoomPercent }}</span>
          <button type="button" class="canvas__tool-btn" title="放大" @click="zoomIn">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef } from 'vue'
import type { Graph } from '@antv/x6'
import type { Node } from '@antv/x6'
import {
  ADD_NODE_GROUPS,
  EMPTY_HINT,
  IMAGE_NODE_TOOLBAR,
  NODE_TEMPLATES,
  PROMPT_PLACEHOLDER,
  VIDEO_NODE_TOOLBAR,
  type CanvasNodeData,
  type ImageGenTask,
  type NodeKind,
} from './constants'
import {
  bindPortConnectDrag,
  type ConnectGhostState,
} from './connectDrag'
import {
  applyImageGenTask as applyImageGenTaskToNode,
  spawnImageGenNode,
} from './imageGen'
import {
  addCanvasNode,
  bindGraphInteraction,
  createGraph,
  getNodeToolbarPosition,
  getScroller,
} from './graph'
import {
  applyCanvasBgTheme,
  getCanvasBgThemeMeta,
  type CanvasBgTheme,
} from './canvasTheme'
import { tidyCanvas } from './layout'
import { createMinimap, destroyMinimap } from './minimap'
import { runUploadSimulation } from './upload'

const graphRef = ref<HTMLElement | null>(null)
const minimapContainerRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const graph = shallowRef<Graph | null>(null)
const nodeCount = ref(0)
const zoomLevel = ref(1)
const gridVisible = ref(true)
const canvasBgTheme = ref<CanvasBgTheme>('dark')
const panMode = ref(true)
const showMinimap = ref(true)
const showAddMenu = ref(false)
const addMenuAtCursor = ref(false)
const addMenuPosition = ref({ left: 0, top: 0 })
const pendingAddPoint = ref<{ x: number; y: number } | null>(null)

const ADD_MENU_SIZE = { width: 248, height: 400 }

const addMenuStyle = computed(() => {
  if (!addMenuAtCursor.value) return undefined
  return {
    left: `${addMenuPosition.value.left}px`,
    top: `${addMenuPosition.value.top}px`,
  }
})
const showAssetsPanel = ref(false)
const assetsTab = ref<'all' | 'mine'>('mine')
const assetsLoading = ref(false)
const promptText = ref('')
const activePickerNodeId = ref('')
const selectedNodeId = ref('')
const pendingUploadNodeId = ref('')
const toolbarPos = ref({ left: 0, top: 0 })
const selectedKind = ref<NodeKind | null>(null)
const connectGhost = ref<ConnectGhostState>({
  visible: false,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
})
let teardownConnectDrag: (() => void) | null = null
let ignoreNextBlankClick = false

const isEmpty = computed(() => nodeCount.value === 0)
const zoomPercent = computed(() => `${Math.round(zoomLevel.value * 100)}%`)
const canvasBgThemeLabel = computed(
  () => getCanvasBgThemeMeta(canvasBgTheme.value).label,
)
const showPromptBar = computed(() => Boolean(activePickerNodeId.value) && nodeCount.value > 0)

const activeToolbarItems = computed(() => {
  if (selectedKind.value === 'video') return VIDEO_NODE_TOOLBAR.slice(0, 4)
  if (selectedKind.value === 'image') return IMAGE_NODE_TOOLBAR
  return []
})

const showNodeToolbar = computed(() => Boolean(selectedNodeId.value))

const showToolbarFeatureButtons = computed(() => {
  if (selectedKind.value === 'image' && selectedNodeId.value) {
    const cell = graph.value?.getCellById(selectedNodeId.value)
    const data = cell?.getData() as CanvasNodeData | undefined
    if (!data?.imageGenTask) return Boolean(data?.previewUrl)
    return data.imageGenTask === 'img2img'
  }
  if (selectedKind.value !== 'video' || !selectedNodeId.value) return false
  const cell = graph.value?.getCellById(selectedNodeId.value)
  const data = cell?.getData() as CanvasNodeData | undefined
  return data?.mode !== 'picker'
})

function requestCanvasUpload(nodeId: string) {
  pendingUploadNodeId.value = nodeId
  fileInputRef.value?.click()
}

provide('requestCanvasUpload', requestCanvasUpload)

function handleApplyImageGenTask(nodeId: string, task: ImageGenTask) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  applyImageGenTaskToNode(cell as Node, task)
  selectedNodeId.value = nodeId
  updateNodeToolbar()
}

provide('applyImageGenTask', handleApplyImageGenTask)

function handleConnectDrop(source: Node, point: { x: number; y: number }) {
  const g = graph.value
  if (!g) return

  const spawned = spawnImageGenNode(g, source, 'picker', point)
  selectedNodeId.value = spawned.id
  syncNodeSelectionHighlight(spawned.id)
  updateNodeToolbar()
  syncNodeCount()
}

function removeNodeById(nodeId: string) {
  const g = graph.value
  if (!g || !nodeId) return

  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return

  g.removeCell(cell)
  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = ''
    selectedKind.value = null
    syncNodeSelectionHighlight('')
  }
  if (activePickerNodeId.value === nodeId) {
    activePickerNodeId.value = ''
  }
  syncNodeCount()
}

provide('deleteCanvasNode', removeNodeById)

function syncNodeCount() {
  nodeCount.value = graph.value?.getNodes().length ?? 0
  if (nodeCount.value === 0) {
    activePickerNodeId.value = ''
    selectedNodeId.value = ''
  }
}

function syncZoom(scale?: number) {
  if (typeof scale === 'number' && !Number.isNaN(scale)) {
    zoomLevel.value = scale
    return
  }
  zoomLevel.value = graph.value?.zoom() ?? 1
}

function getGraphCenter() {
  const g = graph.value
  if (!g || !graphRef.value) return { x: 400, y: 320 }
  const { width, height } = graphRef.value.getBoundingClientRect()
  return g.clientToLocal(width / 2, height / 2)
}

function syncNodeSelectionHighlight(nodeId: string) {
  const g = graph.value
  if (!g) return

  g.getNodes().forEach((node) => {
    const data = node.getData() as CanvasNodeData
    const isSelected = node.id === nodeId
    if (Boolean(data.isSelected) === isSelected) return
    node.setData({ ...data, isSelected })
  })
}

function updateNodeToolbar() {
  const g = graph.value
  const id = selectedNodeId.value
  if (!g || !id || !graphRef.value) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return

  const data = cell.getData() as CanvasNodeData
  selectedKind.value = data.kind
  const pos = getNodeToolbarPosition(g, cell as Node, graphRef.value)
  toolbarPos.value = pos
}

function addNode(kind: NodeKind, point?: { x: number; y: number }) {
  const g = graph.value
  if (!g) return

  const position = point ?? getGraphCenter()
  const node = addCanvasNode(g, kind, position)
  const data = node.getData() as CanvasNodeData

  if (data.mode === 'picker' && (kind === 'text' || kind === 'audio')) {
    activePickerNodeId.value = node.id
  }

  selectedNodeId.value = node.id
  updateNodeToolbar()
  closeAddMenu()
  syncNodeCount()
  return node
}

function addFromTemplate(kind: NodeKind) {
  addNode(kind)
}

function addFromMenu(kind: NodeKind) {
  const center = getGraphCenter()
  addNode(kind, {
    x: center.x + (Math.random() - 0.5) * 100,
    y: center.y + (Math.random() - 0.5) * 80,
  })
}

function clampAddMenuPosition(left: number, top: number) {
  const host = graphRef.value?.parentElement
  if (!host) return { left, top }
  const maxLeft = host.clientWidth - ADD_MENU_SIZE.width - 12
  const maxTop = host.clientHeight - ADD_MENU_SIZE.height - 12
  return {
    left: Math.min(Math.max(12, left), Math.max(12, maxLeft)),
    top: Math.min(Math.max(12, top), Math.max(12, maxTop)),
  }
}

function openAddMenuAtGraphPoint(point: { x: number; y: number }) {
  const g = graph.value
  const container = graphRef.value
  if (!g || !container) return

  pendingAddPoint.value = point
  addMenuAtCursor.value = true
  const client = g.localToClient(point.x, point.y)
  const rect = container.getBoundingClientRect()
  const pos = clampAddMenuPosition(
    client.x - rect.left + 12,
    client.y - rect.top + 12,
  )
  addMenuPosition.value = pos
  showAddMenu.value = true
  showAssetsPanel.value = false
}

function openAddMenuFromToolbar() {
  pendingAddPoint.value = null
  addMenuAtCursor.value = false
  showAddMenu.value = true
  showAssetsPanel.value = false
}

function closeAddMenu() {
  showAddMenu.value = false
  pendingAddPoint.value = null
  addMenuAtCursor.value = false
}

function onMenuItem(item: (typeof ADD_NODE_GROUPS)[number]['items'][number]) {
  const point = pendingAddPoint.value

  if ('action' in item && item.action === 'upload') {
    if (point) {
      const created = addNode('image', point)
      if (created) pendingUploadNodeId.value = created.id
    } else {
      pendingUploadNodeId.value = ''
    }
    fileInputRef.value?.click()
    closeAddMenu()
    return
  }
  if ('action' in item && item.action === 'history') {
    closeAddMenu()
    openAssetsPanel()
    return
  }

  if (point) {
    addNode(item.kind, point)
    pendingAddPoint.value = null
  } else {
    addFromMenu(item.kind)
  }
  closeAddMenu()
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !graph.value) return

  const isVideo = file.type.startsWith('video/')
  const kind: NodeKind = isVideo ? 'video' : 'image'

  let node: Node | undefined
  if (pendingUploadNodeId.value) {
    const cell = graph.value.getCellById(pendingUploadNodeId.value)
    if (cell?.isNode()) node = cell as Node
  }

  if (!node) {
    const created = addNode(kind)
    if (!created) return
    node = created
  } else {
    const data = { ...(node.getData() as CanvasNodeData) }
    data.mode = 'editor'
    node.setData(data)
  }

  pendingUploadNodeId.value = ''
  selectedNodeId.value = node.id
  runUploadSimulation(node, file)
  updateNodeToolbar()
}

function toggleAddMenu() {
  if (showAddMenu.value) {
    closeAddMenu()
    return
  }
  openAddMenuFromToolbar()
}

function openAssetsPanel() {
  showAssetsPanel.value = true
  closeAddMenu()
  assetsLoading.value = true
  window.setTimeout(() => {
    assetsLoading.value = false
  }, 800)
}

function toggleAssetsPanel() {
  if (showAssetsPanel.value) {
    showAssetsPanel.value = false
  } else {
    openAssetsPanel()
  }
}

function togglePanMode() {
  panMode.value = !panMode.value
  const scroller = graph.value ? getScroller(graph.value) : null
  if (!scroller) return
  scroller.togglePanning(panMode.value)
}

function handleTidyCanvas() {
  const g = graph.value
  if (!g || g.getNodes().length === 0) return
  tidyCanvas(g)
  updateNodeToolbar()
}

async function setupMinimap() {
  const g = graph.value
  const container = minimapContainerRef.value
  if (!g || !container || !showMinimap.value) return

  if (g.getPlugin('minimap')) {
    destroyMinimap(g)
  }

  await nextTick()
  createMinimap(g, container, canvasBgTheme.value)
}

async function toggleCanvasBgTheme() {
  canvasBgTheme.value = canvasBgTheme.value === 'dark' ? 'light' : 'dark'
  applyCanvasBgTheme(graph.value, canvasBgTheme.value, gridVisible.value)

  if (showMinimap.value) {
    teardownMinimap()
    await setupMinimap()
  }
}

function teardownMinimap() {
  const g = graph.value
  if (!g || !g.getPlugin('minimap')) return
  destroyMinimap(g)
}

async function toggleMinimap() {
  showMinimap.value = !showMinimap.value
  if (showMinimap.value) {
    await setupMinimap()
  } else {
    teardownMinimap()
  }
}

function toggleGrid() {
  const g = graph.value
  if (!g) return
  gridVisible.value = !gridVisible.value
  if (gridVisible.value) {
    g.showGrid()
    applyCanvasBgTheme(g, canvasBgTheme.value, gridVisible.value)
  } else {
    g.hideGrid()
  }
}

function zoomIn() {
  graph.value?.zoom(0.12)
  syncZoom()
  updateNodeToolbar()
}

function zoomOut() {
  graph.value?.zoom(-0.12)
  syncZoom()
  updateNodeToolbar()
}

function removeSelectedNode() {
  const id = selectedNodeId.value
  if (!id) return
  removeNodeById(id)
}

function handleBlankDblClick(event: { x: number; y: number }) {
  ignoreNextBlankClick = true
  openAddMenuAtGraphPoint({ x: event.x, y: event.y })
  window.setTimeout(() => {
    ignoreNextBlankClick = false
  }, 0)
}

function handleNodeClick({ node }: { node: Node }) {
  const data = node.getData() as CanvasNodeData
  selectedNodeId.value = node.id
  selectedKind.value = data.kind
  activePickerNodeId.value =
    data.mode === 'picker' && (data.kind === 'text' || data.kind === 'audio') ? node.id : ''
  syncNodeSelectionHighlight(node.id)
  updateNodeToolbar()
}

function handleNodeUnselected() {
  activePickerNodeId.value = ''
}

function handleBlankClick() {
  if (ignoreNextBlankClick) return
  closeAddMenu()
  selectedNodeId.value = ''
  selectedKind.value = null
  syncNodeSelectionHighlight('')
}

function handleNodeDataChange({ node }: { node: Node }) {
  const data = node.getData() as CanvasNodeData
  if (data.mode === 'editor' && activePickerNodeId.value === node.id) {
    activePickerNodeId.value = ''
  }
  if (selectedNodeId.value === node.id) {
    updateNodeToolbar()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
  if (!selectedNodeId.value) return
  event.preventDefault()
  removeSelectedNode()
}

onMounted(() => {
  if (!graphRef.value) return

  const instance = createGraph(graphRef.value)
  graph.value = instance
  bindGraphInteraction(instance)

  instance.on('blank:dblclick', handleBlankDblClick)
  instance.on('scale', ({ sx }) => {
    syncZoom(sx)
    updateNodeToolbar()
  })
  instance.on('translate', updateNodeToolbar)
  instance.on('node:moving', updateNodeToolbar)
  instance.on('node:moved', updateNodeToolbar)
  instance.on('node:added', syncNodeCount)
  instance.on('node:removed', syncNodeCount)
  instance.on('node:click', handleNodeClick)
  instance.on('blank:click', () => {
    handleBlankClick()
    handleNodeUnselected()
  })
  instance.on('node:change:data', handleNodeDataChange)

  teardownConnectDrag = bindPortConnectDrag(
    instance,
    graphRef.value,
    (state) => {
      connectGhost.value = state
    },
    handleConnectDrop,
  )

  window.addEventListener('keydown', handleKeydown)

  const scroller = getScroller(instance)
  scroller?.togglePanning(panMode.value)

  syncZoom()
  syncNodeCount()

  if (showMinimap.value) {
    nextTick(() => setupMinimap())
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  teardownConnectDrag?.()
  teardownConnectDrag = null
  teardownMinimap()
  graph.value?.dispose()
  graph.value = null
})
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
