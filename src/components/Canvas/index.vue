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
      v-if="showNodeToolbar"
      class="canvas__node-toolbar"
      :class="{ 'canvas__node-toolbar--image': isImageNodeToolbar }"
      :style="{ left: `${toolbarPos.left}px`, top: `${toolbarPos.top}px` }"
      @mousedown.stop
    >
      <template v-if="showToolbarFeatureButtons">
        <template v-if="selectedKind === 'image'">
          <template v-if="showImageToolbarMore">
            <button
              type="button"
              class="canvas__node-toolbar-btn canvas__node-toolbar-btn--icon"
              title="返回"
              @click="closeImageToolbarMore"
            >
              <span class="canvas__node-toolbar-icon" data-icon="back" aria-hidden="true" />
            </button>
            <span class="canvas__node-toolbar-divider" aria-hidden="true" />
            <div class="canvas__node-toolbar-group">
              <template v-for="item in IMAGE_NODE_TOOLBAR_MORE.actions" :key="item.key">
                <div v-if="item.key === 'more'" class="canvas__node-toolbar-more">
                  <button
                    type="button"
                    class="canvas__node-toolbar-btn"
                    :class="{ 'canvas__node-toolbar-btn--active': showImageToolbarMoreMenu }"
                    @click="toggleImageToolbarMoreMenu"
                  >
                    <span
                      v-if="item.icon"
                      class="canvas__node-toolbar-icon"
                      :data-icon="item.icon"
                      aria-hidden="true"
                    />
                    {{ item.label }}
                  </button>
                  <div
                    v-if="showImageToolbarMoreMenu"
                    class="canvas__node-toolbar-menu"
                    @mousedown.stop
                  >
                    <button
                      v-for="menuItem in IMAGE_NODE_TOOLBAR_MORE_MENU"
                      :key="menuItem.key"
                      type="button"
                      class="canvas__node-toolbar-menu-item"
                    >
                      <span
                        class="canvas__node-toolbar-icon"
                        :data-icon="menuItem.icon"
                        aria-hidden="true"
                      />
                      <span class="canvas__node-toolbar-menu-label">{{ menuItem.label }}</span>
                      <span
                        v-if="menuItem.hasSubmenu"
                        class="canvas__node-toolbar-menu-arrow"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
                <div v-else class="canvas__node-toolbar-hover">
                  <button type="button" class="canvas__node-toolbar-btn">
                    <span
                      v-if="item.icon"
                      class="canvas__node-toolbar-icon"
                      :data-icon="item.icon"
                      aria-hidden="true"
                    />
                    {{ item.label }}
                  </button>
                  <span
                    v-if="getImageToolbarMoreHover(item.key)?.tooltip"
                    class="canvas__node-toolbar-tooltip-label"
                  >
                    {{ getImageToolbarMoreHover(item.key)?.tooltip }}
                  </span>
                  <div
                    v-if="getImageToolbarMoreHover(item.key)?.menu?.length"
                    class="canvas__node-toolbar-dropdown-menu"
                    @mousedown.stop
                  >
                    <button
                      v-for="menuLabel in getImageToolbarMoreHover(item.key)?.menu"
                      :key="menuLabel"
                      type="button"
                      class="canvas__node-toolbar-dropdown-item"
                    >
                      {{ menuLabel }}
                    </button>
                  </div>
                </div>
              </template>
            </div>
            <span class="canvas__node-toolbar-divider" aria-hidden="true" />
            <button type="button" class="canvas__node-toolbar-btn canvas__node-toolbar-btn--icon" title="下载">
              <span class="canvas__node-toolbar-icon" data-icon="download" aria-hidden="true" />
            </button>
          </template>
          <template v-else>
            <div class="canvas__node-toolbar-group">
              <button
                type="button"
                class="canvas__node-toolbar-btn"
                :class="{ 'canvas__node-toolbar-btn--active': showImageDialogue }"
                @click="toggleImageDialogue"
              >
                <span class="canvas__node-toolbar-icon" data-icon="chat" aria-hidden="true" />
                {{ IMAGE_NODE_TOOLBAR.chat.label }}
              </button>
            </div>
            <span class="canvas__node-toolbar-divider" aria-hidden="true" />
            <div class="canvas__node-toolbar-group">
              <template v-for="item in IMAGE_NODE_TOOLBAR.actions" :key="item.key">
                <div v-if="item.key === 'cutout'" class="canvas__node-toolbar-dropdown">
                  <button type="button" class="canvas__node-toolbar-btn">
                    <span
                      class="canvas__node-toolbar-icon"
                      data-icon="cutout"
                      aria-hidden="true"
                    />
                    {{ item.label }}
                  </button>
                  <div class="canvas__node-toolbar-dropdown-menu" @mousedown.stop>
                    <button
                      v-for="mode in IMAGE_CUTOUT_MODES"
                      :key="mode"
                      type="button"
                      class="canvas__node-toolbar-dropdown-item"
                    >
                      {{ mode }}
                    </button>
                  </div>
                </div>
                <div v-else-if="item.key === 'hd'" class="canvas__node-toolbar-hd">
                  <button
                    type="button"
                    class="canvas__node-toolbar-btn"
                    :class="{ 'canvas__node-toolbar-btn--active': showImageHdMenu }"
                    @click="toggleImageHdMenu"
                  >
                    {{ item.label }}
                  </button>
                  <div
                    v-if="showImageHdMenu"
                    class="canvas__node-toolbar-hd-menu"
                    @mousedown.stop
                  >
                    <button
                      v-for="resolution in IMAGE_HD_RESOLUTIONS"
                      :key="resolution"
                      type="button"
                      class="canvas__node-toolbar-hd-item"
                    >
                      {{ resolution }}
                    </button>
                  </div>
                </div>
                <div v-else-if="item.key === 'inpaint'" class="canvas__node-toolbar-tooltip">
                  <button type="button" class="canvas__node-toolbar-btn">
                    <span
                      class="canvas__node-toolbar-icon"
                      data-icon="edit"
                      aria-hidden="true"
                    />
                    {{ item.label }}
                  </button>
                  <span class="canvas__node-toolbar-tooltip-label">{{ item.label }}</span>
                </div>
                <button
                  v-else
                  type="button"
                  class="canvas__node-toolbar-btn"
                  @click="onImageToolbarAction(item.key)"
                >
                  <span
                    v-if="item.icon"
                    class="canvas__node-toolbar-icon"
                    :data-icon="item.icon"
                    aria-hidden="true"
                  />
                  {{ item.label }}
                </button>
              </template>
            </div>
            <span class="canvas__node-toolbar-divider" aria-hidden="true" />
            <button type="button" class="canvas__node-toolbar-btn canvas__node-toolbar-btn--icon" title="下载">
              <span class="canvas__node-toolbar-icon" data-icon="download" aria-hidden="true" />
            </button>
          </template>
        </template>
        <template v-else>
          <button
            v-for="item in activeToolbarItems"
            :key="item"
            type="button"
            class="canvas__node-toolbar-btn"
          >
            {{ item }}
          </button>
          <button type="button" class="canvas__node-toolbar-btn" title="下载">↓</button>
          <button type="button" class="canvas__node-toolbar-btn" title="全屏">⤢</button>
        </template>
      </template>
      <button
        v-if="selectedKind !== 'image'"
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
      v-if="showImageDialogue && selectedKind === 'image'"
      class="canvas__image-dialogue"
      :style="{
        left: `${dialoguePos.left}px`,
        top: `${dialoguePos.top}px`,
        width: `${dialoguePos.width}px`,
      }"
      @mousedown.stop
    >
      <ImageDialoguePanel v-model="imageDialogueText" />
    </div>

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
      v-if="showConnectMenu"
      class="canvas__connect-menu"
      :style="{ left: `${connectMenuPos.left}px`, top: `${connectMenuPos.top}px` }"
      @mousedown.stop
    >
      <h4 class="canvas__connect-title">引用该节点生成</h4>
      <button
        v-for="item in CONNECT_GENERATE_MENU"
        :key="item.key"
        type="button"
        class="canvas__connect-item"
        :class="{ 'canvas__connect-item--disabled': item.disabled }"
        :disabled="item.disabled"
        @click="onConnectMenuItem(item)"
      >
        <span class="canvas__connect-icon" :data-icon="item.icon" />
        <span class="canvas__connect-label">
          {{ item.label }}
          <em
            v-if="item.badge"
            class="canvas__connect-badge"
            :class="{
              'canvas__connect-badge--new': item.badge === 'NEW',
              'canvas__connect-badge--beta': item.badge === 'Beta',
            }"
          >
            {{ item.badge }}
          </em>
        </span>
      </button>
    </div>

    <div
      v-if="showAddMenu"
      class="canvas__add-menu"
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
          <span class="canvas__add-item-main">
            <span class="canvas__add-item-label">
              {{ item.label }}
              <em v-if="'badge' in item && item.badge" class="canvas__add-badge">{{ item.badge }}</em>
            </span>
            <span class="canvas__add-item-desc">{{ item.desc }}</span>
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
import type { Edge, Graph, Node } from '@antv/x6'
import ImageDialoguePanel from './ImageDialoguePanel.vue'
import {
  ADD_NODE_GROUPS,
  CONNECT_GENERATE_MENU,
  IMAGE_NODE_TOOLBAR,
  IMAGE_NODE_TOOLBAR_MORE,
  IMAGE_NODE_TOOLBAR_MORE_MENU,
  IMAGE_HD_RESOLUTIONS,
  IMAGE_CUTOUT_MODES,
  getImageToolbarMoreHover,
  PROMPT_PLACEHOLDER,
  VIDEO_NODE_TOOLBAR,
  type CanvasNodeData,
  type ImageGenTask,
  type NodeKind,
} from './constants'
import { applyImageGenTask as applyImageGenTaskToNode } from './imageGen'
import {
  canOpenConnectMenu,
  createNodeFromConnectMenu,
  getDefaultConnectPoint,
} from './nodeConnect'
import type { ConnectMenuKey } from './constants'
import {
  addCanvasNode,
  bindGraphInteraction,
  createGraph,
  getNodeDialoguePosition,
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
const showConnectMenu = ref(false)
const connectMenuPos = ref({ left: 0, top: 0 })
const connectSourceNodeId = ref('')
const connectDropPoint = ref<{ x: number; y: number } | null>(null)
const showAssetsPanel = ref(false)
const assetsTab = ref<'all' | 'mine'>('mine')
const assetsLoading = ref(false)
const promptText = ref('')
const activePickerNodeId = ref('')
const selectedNodeId = ref('')
const pendingUploadNodeId = ref('')
const toolbarPos = ref({ left: 0, top: 0 })
const dialoguePos = ref({ left: 0, top: 0, width: 360 })
const selectedKind = ref<NodeKind | null>(null)
const showImageToolbarMore = ref(false)
const showImageToolbarMoreMenu = ref(false)
const showImageHdMenu = ref(false)
const showImageDialogue = ref(false)
const imageDialogueText = ref('')

const zoomPercent = computed(() => `${Math.round(zoomLevel.value * 100)}%`)
const canvasBgThemeLabel = computed(
  () => getCanvasBgThemeMeta(canvasBgTheme.value).label,
)
const showPromptBar = computed(() => Boolean(activePickerNodeId.value) && nodeCount.value > 0)

const activeToolbarItems = computed(() => {
  if (selectedKind.value === 'video') return VIDEO_NODE_TOOLBAR.slice(0, 4)
  return []
})

const showNodeToolbar = computed(() => Boolean(selectedNodeId.value))
const toolbarRevision = ref(0)

function getSelectedNodeData(): CanvasNodeData | undefined {
  const id = selectedNodeId.value
  if (!id) return undefined
  return graph.value?.getCellById(id)?.getData() as CanvasNodeData | undefined
}

function canShowImageToolbar(data: CanvasNodeData | undefined) {
  if (!data || data.kind !== 'image') return false
  if (data.imageGenTask === 'picker') return false
  if (data.imageGenTask === 'img2img' || data.imageGenTask === 'hd') return true
  return data.mode === 'editor'
}

function bumpToolbarRevision() {
  toolbarRevision.value += 1
}

const showToolbarFeatureButtons = computed(() => {
  void toolbarRevision.value

  if (selectedKind.value === 'image' && selectedNodeId.value) {
    return canShowImageToolbar(getSelectedNodeData())
  }
  if (selectedKind.value !== 'video' || !selectedNodeId.value) return false
  const data = getSelectedNodeData()
  return data?.mode !== 'picker'
})

const isImageNodeToolbar = computed(
  () => selectedKind.value === 'image' && showToolbarFeatureButtons.value,
)

function openImageToolbarMore() {
  showImageToolbarMore.value = true
  showImageToolbarMoreMenu.value = false
  showImageHdMenu.value = false
}

function closeImageToolbarMore() {
  showImageToolbarMore.value = false
  showImageToolbarMoreMenu.value = false
}

function toggleImageToolbarMoreMenu() {
  showImageToolbarMoreMenu.value = !showImageToolbarMoreMenu.value
}

function toggleImageHdMenu() {
  showImageHdMenu.value = !showImageHdMenu.value
  if (showImageHdMenu.value) {
    showImageToolbarMoreMenu.value = false
  }
}

function onImageToolbarAction(key: string) {
  showImageHdMenu.value = false
  if (key === 'more') {
    openImageToolbarMore()
  }
}

function resetImageToolbarMore() {
  showImageToolbarMore.value = false
  showImageToolbarMoreMenu.value = false
  showImageHdMenu.value = false
}

function toggleImageDialogue() {
  showImageDialogue.value = !showImageDialogue.value
  showImageHdMenu.value = false
  if (showImageDialogue.value) {
    updateNodeToolbar()
  }
}

function resetImageDialogue() {
  showImageDialogue.value = false
}

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

function closeConnectMenu() {
  showConnectMenu.value = false
  connectSourceNodeId.value = ''
  connectDropPoint.value = null
}

function openConnectMenu(source: Node, graphPoint: { x: number; y: number }) {
  const g = graph.value
  if (!g || !graphRef.value) return

  showAddMenu.value = false
  connectSourceNodeId.value = source.id
  connectDropPoint.value = graphPoint

  const client = g.localToClient(graphPoint.x, graphPoint.y)
  const rect = graphRef.value.getBoundingClientRect()
  const menuWidth = 220
  const menuHeight = 360
  connectMenuPos.value = {
    left: Math.max(12, Math.min(client.x - rect.left + 10, rect.width - menuWidth - 12)),
    top: Math.max(60, Math.min(client.y - rect.top - 24, rect.height - menuHeight - 12)),
  }
  showConnectMenu.value = true
}

function finishConnectSpawn(node: Node) {
  selectedNodeId.value = node.id
  syncNodeSelectionHighlight(node.id)
  updateNodeToolbar()
  syncNodeCount()
  closeConnectMenu()
}

function onConnectMenuItem(item: (typeof CONNECT_GENERATE_MENU)[number]) {
  if (item.disabled) return

  const g = graph.value
  const sourceId = connectSourceNodeId.value
  const point = connectDropPoint.value
  if (!g || !sourceId || !point) return

  const source = g.getCellById(sourceId)
  if (!source?.isNode()) return

  const spawned = createNodeFromConnectMenu(
    g,
    source as Node,
    point,
    item.key as ConnectMenuKey,
  )
  if (!spawned) return

  const data = spawned.getData() as CanvasNodeData
  if (data.mode === 'picker' && (data.kind === 'text' || data.kind === 'audio')) {
    activePickerNodeId.value = spawned.id
  }

  finishConnectSpawn(spawned)
}

function connectFromNode(nodeId: string) {
  const g = graph.value
  if (!g) return

  const cell = g.getCellById(nodeId)
  if (!cell?.isNode() || !canOpenConnectMenu(cell as Node)) return

  openConnectMenu(cell as Node, getDefaultConnectPoint(cell as Node))
}

provide('connectFromNode', connectFromNode)

function handlePortClick({ node, port }: { node: Node; port?: string }) {
  if (port !== 'right') return
  connectFromNode(node.id)
}

function handleEdgeConnected({ edge, isNew }: { edge: Edge; isNew?: boolean }) {
  if (!isNew) return
  const g = graph.value
  if (!g) return

  if (edge.getTargetCell()) return

  const target = edge.getTarget()
  if (!target || typeof target !== 'object' || !('x' in target) || !('y' in target)) {
    return
  }

  const source = edge.getSourceCell()
  if (!source?.isNode() || !canOpenConnectMenu(source as Node)) {
    g.removeEdge(edge)
    return
  }

  g.removeEdge(edge)
  openConnectMenu(source as Node, {
    x: Number(target.x),
    y: Number(target.y),
  })
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
  const node = cell as Node
  toolbarPos.value = getNodeToolbarPosition(g, node, graphRef.value)
  dialoguePos.value = getNodeDialoguePosition(g, node, graphRef.value)
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
  showAddMenu.value = false
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

function onMenuItem(item: (typeof ADD_NODE_GROUPS)[number]['items'][number]) {
  if ('action' in item && item.action === 'upload') {
    pendingUploadNodeId.value = ''
    fileInputRef.value?.click()
    showAddMenu.value = false
    return
  }
  if ('action' in item && item.action === 'history') {
    showAddMenu.value = false
    openAssetsPanel()
    return
  }
  addFromMenu(item.kind)
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
  showAddMenu.value = !showAddMenu.value
  if (showAddMenu.value) {
    showAssetsPanel.value = false
    closeConnectMenu()
  }
}

function openAssetsPanel() {
  showAssetsPanel.value = true
  showAddMenu.value = false
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
  addNode('video', { x: event.x, y: event.y })
}

function handleNodeClick({ node }: { node: Node }) {
  const data = node.getData() as CanvasNodeData
  selectedNodeId.value = node.id
  selectedKind.value = data.kind
  resetImageToolbarMore()
  resetImageDialogue()
  bumpToolbarRevision()
  activePickerNodeId.value =
    data.mode === 'picker' && (data.kind === 'text' || data.kind === 'audio') ? node.id : ''
  syncNodeSelectionHighlight(node.id)
  updateNodeToolbar()
}

function handleNodeUnselected() {
  activePickerNodeId.value = ''
}

function handleBlankClick() {
  showAddMenu.value = false
  closeConnectMenu()
  selectedNodeId.value = ''
  selectedKind.value = null
  resetImageToolbarMore()
  resetImageDialogue()
  syncNodeSelectionHighlight('')
}

function handleNodeDataChange({ node }: { node: Node }) {
  const data = node.getData() as CanvasNodeData
  if (data.mode === 'editor' && activePickerNodeId.value === node.id) {
    activePickerNodeId.value = ''
  }
  if (selectedNodeId.value === node.id) {
    selectedKind.value = data.kind
    bumpToolbarRevision()
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
  instance.on('node:port:click', handlePortClick)
  instance.on('edge:connected', handleEdgeConnected)

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
  teardownMinimap()
  graph.value?.dispose()
  graph.value = null
})
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
