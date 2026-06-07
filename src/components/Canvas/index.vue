<template>
  <div ref="canvasRef" class="canvas" :class="`canvas--bg-${canvasBgTheme}`">
    <CanvasHeader
      :canvas-bg-theme="canvasBgTheme"
      :current-project-name="currentProjectName"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :credits="canvasCredits"
      :show-project-menu="showProjectMenu"
      :show-user-menu="showUserMenu"
      :projects="canvasProjects"
      :active-project-id="activeProjectId"
      :user-name="userMenuName"
      :user-role="userMenuRole"
      :user-points="userMenuPoints"
      @go-home="onGoHome"
      @toggle-project-menu="toggleProjectMenu"
      @select-project="selectProject"
      @undo="handleUndo"
      @redo="handleRedo"
      @save="handleSaveCanvas"
      @export="handleExportCanvas"
      @toggle-user-menu="toggleUserMenu"
      @go-user-center="goUserCenter"
      @open-combo="openComboModal"
      @user-menu-action="handleUserMenuAction"
      @logout="handleLogout"
    />

    <div ref="graphRef" class="canvas__graph" />

    <CanvasNodeToolbar
      v-if="showNodeToolbar && !showImageCrop"
      :position="toolbarPos"
      :is-light="isLightNodeToolbar"
      :show-feature-buttons="showToolbarFeatureButtons"
      :selected-kind="selectedKind"
      :show-image-toolbar-more="showImageToolbarMore"
      :show-image-toolbar-more-menu="showImageToolbarMoreMenu"
      :show-image-hd-menu="showImageHdMenu"
      :show-image-dialogue="showImageDialogue"
      :show-image-crop="showImageCrop"
      :show-video-dialogue="showVideoDialogue"
      :show-video-hd-panel="showVideoHdPanel"
      :show-video-frames-panel="showVideoFramesPanel"
      @close-image-toolbar-more="closeImageToolbarMore"
      @toggle-image-toolbar-more-menu="toggleImageToolbarMoreMenu"
      @toggle-image-hd-menu="toggleImageHdMenu"
      @toggle-image-dialogue="toggleImageDialogue"
      @image-toolbar-action="onImageToolbarAction"
      @toggle-video-dialogue="toggleVideoDialogue"
      @toggle-video-hd-panel="toggleVideoHdPanel"
      @toggle-video-frames-panel="toggleVideoFramesPanel"
    />

    <CanvasAssetsPanel
      v-if="showAssetsPanel"
      :tab="assetsTab"
      :loading="assetsLoading"
      @update:tab="assetsTab = $event"
      @close="showAssetsPanel = false"
    />

    <CanvasNodeOverlays
      :canvas-bg-theme="canvasBgTheme"
      :show-prompt-bar="showPromptBar"
      :show-image-gen-prompt-bar="showImageGenPromptBar"
      :show-video-gen-prompt-bar="showVideoGenPromptBar"
      :prompt-pos="promptPos"
      :image-gen-prompt-pos="imageGenPromptPos"
      :video-gen-prompt-pos="videoGenPromptPos"
      :image-crop-pos="imageCropPos"
      :dialogue-pos="dialoguePos"
      :video-hd-pos="videoHdPos"
      :selected-kind="selectedKind"
      :show-image-crop="showImageCrop"
      :show-image-dialogue="showImageDialogue"
      :show-video-dialogue="showVideoDialogue"
      :show-video-hd-panel="showVideoHdPanel"
      :show-video-frames-panel="showVideoFramesPanel"
      :image-crop-source="imageCropSource"
      :prompt-text="promptText"
      :prompt-source-preview-url="promptSourcePreviewUrl"
      :prompt-submitting="promptSubmitting"
      :can-submit-text-prompt="canSubmitTextPrompt"
      :is-img2-prompt-task="isImg2PromptTask"
      :image-gen-prompt-text="imageGenPromptText"
      :image-gen-seed="imageGenSeed"
      :image-gen-source-preview-url="imageGenSourcePreviewUrl"
      :video-gen-prompt-text="videoGenPromptText"
      :video-gen-active-tab="videoGenActiveTab"
      :image-dialogue-text="imageDialogueText"
      :video-dialogue-text="videoDialogueText"
      :video-hd-magnification="videoHdMagnification"
      @update:prompt-text="promptText = $event"
      @persist-prompt-bar-draft="persistPromptBarDraft"
      @submit-text-prompt="submitTextPrompt"
      @update:image-gen-prompt-text="imageGenPromptText = $event; persistImageGenPrompt()"
      @update:image-gen-seed="imageGenSeed = $event; persistImageGenPrompt()"
      @update:video-gen-prompt-text="videoGenPromptText = $event; persistVideoGenPrompt()"
      @update:video-gen-active-tab="videoGenActiveTab = $event; persistVideoGenPrompt()"
      @update:image-dialogue-text="imageDialogueText = $event"
      @update:video-dialogue-text="videoDialogueText = $event"
      @update:video-hd-magnification="videoHdMagnification = $event"
      @close-image-crop="closeImageCrop"
      @image-crop-complete="onImageCropComplete"
      @reset-video-hd-panel="resetVideoHdPanel"
      @video-hd-start="onVideoHdStart"
    />

    <input
      ref="fileInputRef"
      type="file"
      class="canvas__file-input"
      accept="image/*,video/*"
      @change="onFileSelected"
    />

    <div
      v-if="showHistoryPanel"
      class="canvas__history-anchor"
      @mousedown.stop
    >
      <CanvasHistoryPanel @close="closeHistoryPanel" />
    </div>

    <CanvasLeftToolbar
      :canvas-bg-theme="canvasBgTheme"
      :show-add-menu="showAddMenu"
      :show-assets-panel="showAssetsPanel"
      :show-history-panel="showHistoryPanel"
      @toggle-add-menu="toggleAddMenu"
      @toggle-assets-panel="toggleAssetsPanel"
      @toggle-history-panel="toggleHistoryPanel"
    />

    <CanvasConnectMenu
      v-if="showConnectMenu"
      :position="connectMenuPos"
      @select="onConnectMenuItem"
    />

    <CanvasAddMenu
      v-if="showAddMenu"
      :canvas-bg-theme="canvasBgTheme"
      :drop-point="addMenuDropPoint"
      :position="addMenuPos"
      @select="onMenuItem"
    />

    <div class="canvas__bottom-left">
      <div
        v-show="showMinimap"
        ref="minimapContainerRef"
        class="canvas__minimap-host"
      />
      <CanvasBottomControls
        :show-minimap="showMinimap"
        :grid-visible="gridVisible"
        :show-shortcuts-panel="showShortcutsPanel"
        :pan-mode="panMode"
        :show-zoom-menu="showZoomMenu"
        :zoom-percent="zoomPercent"
        :theme-label="canvasBgThemeLabel"
        @toggle-theme="toggleCanvasBgTheme"
        @tidy="handleTidyCanvas"
        @toggle-minimap="toggleMinimap"
        @toggle-grid="toggleGrid"
        @toggle-shortcuts="toggleShortcutsPanel"
        @toggle-pan="togglePanMode"
        @toggle-zoom-menu="toggleZoomMenu"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @zoom-menu-action="onZoomMenuAction"
      />
    </div>

    <button
      v-if="showTextDownload"
      type="button"
      class="canvas__text-download"
      :class="{ 'canvas__text-download--light': canvasBgTheme === 'light' }"
      :style="{
        left: `${textDownloadPos.left}px`,
        top: `${textDownloadPos.top}px`,
      }"
      title="下载文本"
      @mousedown.stop
      @click="downloadSelectedTextNode"
    >
      <span class="canvas__node-toolbar-icon" data-icon="download" aria-hidden="true" />
    </button>

    <div
      v-if="showTextFormatToolbar"
      class="canvas__text-format-anchor"
      :style="{
        left: `${textFormatToolbarPos.left}px`,
        top: `${textFormatToolbarPos.top}px`,
        width: `${textFormatToolbarPos.width}px`,
      }"
      @mousedown.stop
    >
      <TextFormatToolbar @command="onTextFormatAction" />
    </div>

    <div
      v-if="textExpandOpen"
      class="canvas__text-expand"
      :class="{ 'canvas__text-expand--light': canvasBgTheme === 'light' }"
      @mousedown.stop
    >
      <div class="canvas__text-expand-head">
        <span>{{ textExpandTitle }}</span>
        <button type="button" class="canvas__text-expand-close" @click="closeTextExpand">×</button>
      </div>
      <div
        ref="textExpandEditorRef"
        class="canvas__text-expand-body"
        contenteditable="true"
        :data-placeholder="TEXT_EDITOR_PLACEHOLDER"
        @input="onTextExpandInput"
      />
    </div>

    <Transition name="canvas-shortcuts-fade">
      <div
        v-if="showShortcutsPanel"
        class="canvas__shortcuts-backdrop"
        @mousedown.self="closeShortcutsPanel"
      >
        <CanvasShortcutsPanel @close="closeShortcutsPanel" />
      </div>
    </Transition>

    <CanvasImagePreview
      v-if="imagePreviewUrl"
      :url="imagePreviewUrl"
      @close="closeImagePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { useModalStore } from '@stores/useModal'
import { useRouter } from 'vue-router'
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue'
import type { Edge, Graph, Node } from '@antv/x6'
import CanvasShortcutsPanel from './CanvasShortcutsPanel.vue'
import CanvasHistoryPanel from './CanvasHistoryPanel.vue'
import CanvasHeader from './panels/CanvasHeader.vue'
import CanvasLeftToolbar from './panels/CanvasLeftToolbar.vue'
import CanvasConnectMenu from './panels/CanvasConnectMenu.vue'
import CanvasAddMenu from './panels/CanvasAddMenu.vue'
import CanvasAssetsPanel from './panels/CanvasAssetsPanel.vue'
import CanvasNodeToolbar from './panels/CanvasNodeToolbar.vue'
import CanvasNodeOverlays from './panels/CanvasNodeOverlays.vue'
import CanvasBottomControls from './panels/CanvasBottomControls.vue'
import CanvasImagePreview from './panels/CanvasImagePreview.vue'
import TextFormatToolbar from './TextFormatToolbar.vue'
import type { UserMenuKey } from './panels/CanvasHeader.vue'
import {
  ADD_NODE_GROUPS,
  CANVAS_PROJECTS,
  CONNECT_GENERATE_MENU,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  ZOOM_MENU_PRESETS,
  TEXT_EDITOR_PLACEHOLDER,
  type CanvasNodeData,
  type ImageGenTask,
  type NodeKind,
  type TextFormatCommand,
  type VideoHdMagnification,
} from './constants'
import type { TextEditorApi } from './nodes/useTextEditorRegistry'
import { applyImageGenTask as applyImageGenTaskToNode, spawnCroppedImageNode } from './imageGen'
import {
  canOpenConnectMenu,
  createNodeFromConnectMenu,
  getConnectMenuPosition,
} from './nodeConnect'
import type { ConnectMenuKey } from './constants'
import {
  addCanvasNode,
  bindGraphInteraction,
  createGraph,
  ensureInfiniteCanvasArea,
  getViewportCenterLocal,
  getNodeCropOverlayPosition,
  getNodeDialoguePosition,
  getNodeImageGenPromptPosition,
  getNodeVideoGenPromptPosition,
  getNodePromptPosition,
  getNodeSidePanelPosition,
  getNodeTextDownloadPosition,
  getNodeTextFormatToolbarPosition,
  getNodeToolbarPosition,
  getScroller,
  graphLocalToContainerOffset,
  refreshCanvasNodeViews,
  syncAllNodeSizes,
  type CanvasGraph,
} from './graph'
import {
  applyCanvasBgTheme,
  getCanvasBgThemeMeta,
  type CanvasBgTheme,
} from './canvasTheme'
import { tidyCanvas } from './layout'
import {
  findIncomingImageNode,
  IMG2PROMPT_DEFAULT_INSTRUCTION,
  mockImg2Prompt,
  syncTextNodeImageSource,
} from './textPrompt'
import { createMinimap, destroyMinimap } from './minimap'
import { runUploadSimulation } from './upload'
import {
  getCanvasSnapshot,
  saveCanvasSnapshotToStorage,
  type CanvasSnapshot,
} from './canvasSnapshot'
import { createCanvasHistory } from './canvasHistory'
import { setSharedCanvasBgTheme } from './useCanvasBgTheme'
import { useCanvasKeyboard } from './composables/useCanvasKeyboard'

const router = useRouter()
const modalStore = useModalStore()

const modelType = ref<'img2prompt' | 'text2xhs' | 'free'>('free')
const promptSourcePreviewUrl = ref('')
const promptSourceFileName = ref('')
const promptSubmitting = ref(false)
const userMenuName = ref('李阳')
const userMenuRole = ref('普通用户')
const userMenuPoints = ref(3)
const canvasRef = ref<HTMLElement | null>(null)
const graphRef = ref<HTMLElement | null>(null)
const minimapContainerRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const graph = shallowRef<Graph | null>(null)
const nodeCount = ref(0)
const zoomLevel = ref(1)
const showZoomMenu = ref(false)
const gridVisible = ref(false)
const canvasBgTheme = ref<CanvasBgTheme>('light')

watch(canvasBgTheme, (theme) => {
  setSharedCanvasBgTheme(theme)
  const g = graph.value
  if (g) refreshCanvasNodeViews(g)
}, { immediate: true })

const panMode = ref(true)
const showShortcutsPanel = ref(false)
const imagePreviewUrl = ref('')
const canUndo = ref(false)
const canRedo = ref(false)
const nodeClipboard = ref<Record<string, unknown> | null>(null)

let canvasHistory: ReturnType<typeof createCanvasHistory> | null = null
let historyPushTimer: ReturnType<typeof setTimeout> | null = null
let scrollerScrollTarget: HTMLElement | null = null

const showMinimap = ref(false)
const showProjectMenu = ref(false)
const showUserMenu = ref(false)
const canvasProjects = ref([...CANVAS_PROJECTS])
const activeProjectId = ref('draft-2')
const showAddMenu = ref(false)
const showConnectMenu = ref(false)
const connectMenuPos = ref({ left: 0, top: 0 })
const connectReleasePoint = ref<{ x: number; y: number } | null>(null)
const addMenuPos = ref({ left: 0, top: 0 })
const addMenuDropPoint = ref<{ x: number; y: number } | null>(null)
const connectSourceNodeId = ref('')
const connectDropPoint = ref<{ x: number; y: number } | null>(null)
const showAssetsPanel = ref(false)
const showHistoryPanel = ref(false)
const assetsTab = ref<'all' | 'mine'>('mine')
const assetsLoading = ref(false)
const promptText = ref('')
const activePickerNodeId = ref('')
const activeImageGenPromptNodeId = ref('')
const imageGenPromptText = ref('')
const imageGenSeed = ref(58)
const imageGenSourcePreviewUrl = ref('')
const activeVideoGenPromptNodeId = ref('')
const videoGenPromptText = ref('')
const videoGenActiveTab = ref('text2video')
const selectedNodeId = ref('')
const pendingUploadNodeId = ref('')
const toolbarPos = ref({ left: 0, top: 0 })
const dialoguePos = ref({ left: 0, top: 0, width: 360 })
const promptPos = ref({ left: 0, top: 0, width: 360 })
const imageGenPromptPos = ref({ left: 0, top: 0, width: 480 })
const videoGenPromptPos = ref({ left: 0, top: 0, width: 520 })
const imageCropPos = ref({ left: 0, top: 0, width: 360, height: 420 })
const videoHdPos = ref({ left: 0, top: 0, width: 320 })
const selectedKind = ref<NodeKind | null>(null)
const showImageToolbarMore = ref(false)
const showImageToolbarMoreMenu = ref(false)
const showImageHdMenu = ref(false)
const showImageDialogue = ref(false)
const showImageCrop = ref(false)
const cropSourceNodeId = ref('')
const showVideoDialogue = ref(false)
const showVideoHdPanel = ref(false)
const showVideoFramesPanel = ref(false)
const imageDialogueText = ref('')
const videoDialogueText = ref('')
const videoHdMagnification = ref<VideoHdMagnification>('2')
const canvasCredits = ref(12003)
const textFormatToolbarPos = ref({ left: 0, top: 0, width: 420 })
const textDownloadPos = ref({ left: 0, top: 0 })
const textExpandOpen = ref(false)
const textExpandNodeId = ref('')
const textExpandTitle = ref('')
const textExpandEditorRef = ref<HTMLElement | null>(null)
const textEditorApis = new Map<string, TextEditorApi>()

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu() {
  showUserMenu.value = false
}

function goUserCenter() {
  closeUserMenu()
  router.push({ name: 'userInfo' })
}

function openComboModal() {
  closeUserMenu()
  modalStore.openModal('combo')
}

function handleUserMenuAction(key: UserMenuKey) {
  if (key === 'projects') {
    closeUserMenu()
    router.push({ name: 'project' })
    return
  }
  closeUserMenu()
}

function handleLogout() {
  closeUserMenu()
  modalStore.openModal('login')
}

const zoomPercent = computed(() => `${Math.round(zoomLevel.value * 100)}%`)
const currentProjectName = computed(
  () => canvasProjects.value.find((project) => project.id === activeProjectId.value)?.name ?? '未命名创作',
)
const canvasBgThemeLabel = computed(
  () => getCanvasBgThemeMeta(canvasBgTheme.value).label,
)
const showPromptBar = computed(() => {
  const id = activePickerNodeId.value
  if (!id || nodeCount.value === 0 || showImageCrop.value) return false
  const data = graph.value?.getCellById(id)?.getData() as CanvasNodeData | undefined
  return data?.textGenState !== 'loading'
})
const showImageGenPromptBar = computed(
  () => Boolean(activeImageGenPromptNodeId.value) && nodeCount.value > 0 && !showImageCrop.value,
)
const showVideoGenPromptBar = computed(
  () => Boolean(activeVideoGenPromptNodeId.value) && nodeCount.value > 0 && !showImageCrop.value,
)
const showTextFormatToolbar = computed(() => {
  void toolbarRevision.value
  if (!selectedNodeId.value || showImageCrop.value || textExpandOpen.value) return false
  const data = getSelectedNodeData()
  return data?.kind === 'text' && data.mode === 'editor'
})
const showTextDownload = computed(() => showTextFormatToolbar.value)

const isImg2PromptTask = computed(() => {
  void toolbarRevision.value
  const id = activePickerNodeId.value
  if (!id) return false
  const data = graph.value?.getCellById(id)?.getData() as CanvasNodeData | undefined
  return data?.textPickerTask === 'img2prompt'
})

const canSubmitTextPrompt = computed(() => {
  if (isImg2PromptTask.value) {
    return Boolean(promptSourcePreviewUrl.value) && !promptSubmitting.value
  }
  return Boolean(promptText.value.trim()) && !promptSubmitting.value
})

const imageCropSource = computed(() => {
  const data = getSelectedNodeData()
  if (!data?.previewUrl || !data.mediaWidth || !data.mediaHeight) return null
  return {
    previewUrl: data.previewUrl,
    mediaWidth: data.mediaWidth,
    mediaHeight: data.mediaHeight,
  }
})

const showNodeToolbar = computed(() => Boolean(selectedNodeId.value))
const toolbarRevision = ref(0)

function onGoHome() {
  router.push({ name: 'home' })
}

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

const isLightNodeToolbar = computed(
  () =>
    (selectedKind.value === 'image' || selectedKind.value === 'video') &&
    showToolbarFeatureButtons.value,
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
    return
  }
  if (key === 'crop') {
    openImageCrop()
  }
}

function openImageCrop() {
  const data = getSelectedNodeData()
  if (!data?.previewUrl || !data.mediaWidth || !data.mediaHeight) return

  showImageHdMenu.value = false
  showImageDialogue.value = false
  showImageToolbarMore.value = false
  showImageToolbarMoreMenu.value = false
  cropSourceNodeId.value = selectedNodeId.value
  showImageCrop.value = true
  updateNodeToolbar()
}

function closeImageCrop() {
  showImageCrop.value = false
  cropSourceNodeId.value = ''
  updateNodeToolbar()
}

function resetImageCrop() {
  showImageCrop.value = false
  cropSourceNodeId.value = ''
}

function onImageCropComplete(payload: { dataUrl: string; width: number; height: number }) {
  const g = graph.value
  const id = cropSourceNodeId.value || selectedNodeId.value
  if (!g || !id) {
    closeImageCrop()
    return
  }

  const cell = g.getCellById(id)
  if (!cell?.isNode()) {
    closeImageCrop()
    return
  }

  const sourceNode = cell as Node
  const croppedNode = spawnCroppedImageNode(g, sourceNode, payload)
  selectedNodeId.value = croppedNode.id
  selectedKind.value = 'image'
  syncNodeSelectionHighlight(croppedNode.id)
  syncNodeCount()
  closeImageCrop()

  nextTick(() => {
    const scroller = getScroller(g)
    const bbox = croppedNode.getBBox()
    scroller?.transitionToPoint(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, {
      duration: '280ms',
    })
    updateNodeToolbar()
  })
}

function resetImageToolbarMore() {
  showImageToolbarMore.value = false
  showImageToolbarMoreMenu.value = false
  showImageHdMenu.value = false
}

function closeVideoSubPanels(except?: 'dialogue' | 'hd' | 'frames') {
  if (except !== 'dialogue') showVideoDialogue.value = false
  if (except !== 'hd') showVideoHdPanel.value = false
  if (except !== 'frames') showVideoFramesPanel.value = false
}

function openImageDialogue(nodeId?: string) {
  const g = graph.value
  if (!g) return
  const id = nodeId ?? selectedNodeId.value
  if (!id) return
  const cell = g.getCellById(id)
  if (!cell?.isNode()) return
  const data = cell.getData() as CanvasNodeData
  if (data.kind !== 'image') return

  selectedNodeId.value = id
  selectedKind.value = 'image'
  showImageDialogue.value = true
  showImageHdMenu.value = false
  closeImageGenPromptBar()
  syncNodeSelectionHighlight(id)
  updateNodeToolbar()
}

function toggleImageDialogue() {
  if (showImageDialogue.value) {
    resetImageDialogue()
  } else {
    openImageDialogue()
  }
  showImageHdMenu.value = false
}

function handleImageNodeDblClick({ node }: { node: Node }) {
  openImageDialogue(node.id)
}

function toggleVideoDialogue() {
  showVideoDialogue.value = !showVideoDialogue.value
  if (showVideoDialogue.value) {
    closeVideoSubPanels('dialogue')
    updateNodeToolbar()
  }
}

function toggleVideoHdPanel() {
  showVideoHdPanel.value = !showVideoHdPanel.value
  if (showVideoHdPanel.value) {
    closeVideoSubPanels('hd')
    updateNodeToolbar()
  }
}

function toggleVideoFramesPanel() {
  showVideoFramesPanel.value = !showVideoFramesPanel.value
  if (showVideoFramesPanel.value) {
    closeVideoSubPanels('frames')
    updateNodeToolbar()
  }
}

function resetVideoHdPanel() {
  showVideoHdPanel.value = false
}

function resetVideoFramesPanel() {
  showVideoFramesPanel.value = false
}

function onVideoHdStart() {
  resetVideoHdPanel()
}

function resetImageDialogue() {
  showImageDialogue.value = false
}

function resetVideoDialogue() {
  showVideoDialogue.value = false
}

function requestCanvasUpload(nodeId: string) {
  pendingUploadNodeId.value = nodeId
  fileInputRef.value?.click()
}

provide('requestCanvasUpload', requestCanvasUpload)

function loadImageGenPromptFields(nodeId: string) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = cell.getData() as CanvasNodeData
  imageGenPromptText.value = data.genPrompt ?? ''
  imageGenSeed.value = data.genSeed ?? 58
  imageGenSourcePreviewUrl.value = data.sourcePreviewUrl ?? ''
}

function persistImageGenPrompt() {
  const g = graph.value
  const nodeId = activeImageGenPromptNodeId.value
  if (!g || !nodeId) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = { ...(cell.getData() as CanvasNodeData) }
  data.genPrompt = imageGenPromptText.value
  data.genSeed = imageGenSeed.value
  cell.setData(data)
}

function loadVideoGenPromptFields(nodeId: string) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = cell.getData() as CanvasNodeData
  videoGenPromptText.value = data.genPrompt ?? ''
  videoGenActiveTab.value = data.videoGenTab ?? 'text2video'
}

function persistVideoGenPrompt() {
  const g = graph.value
  const nodeId = activeVideoGenPromptNodeId.value
  if (!g || !nodeId) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = { ...(cell.getData() as CanvasNodeData) }
  data.genPrompt = videoGenPromptText.value
  data.videoGenTab = videoGenActiveTab.value
  cell.setData(data)
}

function loadPromptBarContext(nodeId: string) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return

  const synced = syncTextNodeImageSource(g, cell as Node)
  promptSourcePreviewUrl.value = synced.sourcePreviewUrl ?? ''
  promptSourceFileName.value = synced.sourceFileName ?? ''

  if (synced.textPickerTask === 'img2prompt') {
    modelType.value = 'img2prompt'
    promptText.value = synced.genPrompt?.trim() || IMG2PROMPT_DEFAULT_INSTRUCTION
    return
  }

  modelType.value = 'free'
  promptText.value = synced.genPrompt ?? ''
}

function persistPromptBarDraft() {
  const g = graph.value
  const nodeId = activePickerNodeId.value
  if (!g || !nodeId) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = { ...(cell.getData() as CanvasNodeData) }
  data.genPrompt = promptText.value
  cell.setData(data)
}

function plainTextToEditorHtml(text: string) {
  return text
    .split('\n')
    .map((line) => `<p>${line || '<br>'}</p>`)
    .join('')
}

async function submitTextPrompt() {
  if (!canSubmitTextPrompt.value || promptSubmitting.value) return

  const g = graph.value
  const nodeId = activePickerNodeId.value
  if (!g || !nodeId) return

  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return

  promptSubmitting.value = true
  persistPromptBarDraft()

  try {
    if (modelType.value === 'img2prompt' || isImg2PromptTask.value) {
      const imageNode = findIncomingImageNode(g, nodeId)
      const imgData = imageNode?.getData() as CanvasNodeData | undefined
      const loadingData = { ...(cell.getData() as CanvasNodeData), textGenState: 'loading' as const }
      cell.setData(loadingData)

      const result = await mockImg2Prompt(promptText.value, {
        previewUrl: imgData?.previewUrl ?? promptSourcePreviewUrl.value,
        fileName: imgData?.fileName ?? promptSourceFileName.value,
        mediaWidth: imgData?.mediaWidth,
        mediaHeight: imgData?.mediaHeight,
      })

      const data = { ...(cell.getData() as CanvasNodeData) }
      data.content = plainTextToEditorHtml(result)
      data.mode = 'editor'
      data.textPickerTask = ''
      data.textGenState = 'done'
      data.genPrompt = promptText.value
      cell.setData(data)
      selectedNodeId.value = nodeId
      syncNodeSelectionHighlight(nodeId)
      activePickerNodeId.value = ''
      bumpToolbarRevision()
      updateNodeToolbar()
      scheduleHistoryPush()
      return
    }

    const data = { ...(cell.getData() as CanvasNodeData) }
    data.content = plainTextToEditorHtml(promptText.value.trim())
    data.mode = 'editor'
    data.textPickerTask = ''
    cell.setData(data)
    selectedNodeId.value = nodeId
    syncNodeSelectionHighlight(nodeId)
    activePickerNodeId.value = ''
    bumpToolbarRevision()
    updateNodeToolbar()
    scheduleHistoryPush()
  } finally {
    promptSubmitting.value = false
  }
}

function openVideoGenPromptBar(nodeId: string, tab = 'text2video') {
  closeImageGenPromptBar()

  const g = graph.value
  if (g) {
    const cell = g.getCellById(nodeId)
    if (cell?.isNode()) {
      const data = { ...(cell.getData() as CanvasNodeData) }
      if (data.kind === 'video' && data.mode === 'editor' && !data.previewUrl) {
        data.mode = 'picker'
      }
      data.videoGenTab = tab
      cell.setData(data)
    }
  }

  activeVideoGenPromptNodeId.value = nodeId
  activePickerNodeId.value = ''
  videoGenActiveTab.value = tab
  loadVideoGenPromptFields(nodeId)
  updateVideoGenPromptBarPosition()
}

function closeVideoGenPromptBar() {
  activeVideoGenPromptNodeId.value = ''
}

function openImageGenPromptBar(nodeId: string) {
  closeVideoGenPromptBar()

  const g = graph.value
  if (g) {
    const cell = g.getCellById(nodeId)
    if (cell?.isNode()) {
      const data = { ...(cell.getData() as CanvasNodeData) }
      if (data.kind === 'image' && data.imageGenTask === 'img2img') {
        data.imageGenTask = 'picker'
        data.mode = 'picker'
        cell.setData(data)
      }
    }
  }

  activeImageGenPromptNodeId.value = nodeId
  activePickerNodeId.value = ''
  loadImageGenPromptFields(nodeId)
  updateImageGenPromptBarPosition()
}

function closeImageGenPromptBar() {
  activeImageGenPromptNodeId.value = ''
}

function handleApplyImageGenTask(nodeId: string, task: ImageGenTask) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  selectedNodeId.value = nodeId

  if (task === 'img2img') {
    openImageGenPromptBar(nodeId)
    updateNodeToolbar()
    return
  }

  applyImageGenTaskToNode(cell as Node, task)
  closeImageGenPromptBar()
  updateNodeToolbar()
}

provide('applyImageGenTask', handleApplyImageGenTask)

function handleOpenVideoGenPromptBar(nodeId: string, tab?: string) {
  selectedNodeId.value = nodeId
  openVideoGenPromptBar(nodeId, tab ?? 'text2video')
  syncNodeSelectionHighlight(nodeId)
  updateNodeToolbar()
}

provide('openVideoGenPromptBar', handleOpenVideoGenPromptBar)

function removeConnectPreviewEdge() {
  const g = graph.value as CanvasGraph | null
  if (!g?.__connectPreviewEdgeId) return
  const edge = g.getCellById(g.__connectPreviewEdgeId)
  if (edge?.isEdge()) g.removeEdge(edge)
  g.__connectPreviewEdgeId = ''
}

function syncConnectPreviewEdgeTarget() {
  const g = graph.value as CanvasGraph | null
  if (!g?.__connectPreviewEdgeId || !canvasRef.value) return
  const edge = g.getCellById(g.__connectPreviewEdgeId)
  if (!edge?.isEdge()) return

  const rect = canvasRef.value.getBoundingClientRect()
  const clientX = rect.left + connectMenuPos.value.left
  const clientY = rect.top + connectMenuPos.value.top
  edge.setTarget(g.clientToLocal(clientX, clientY))
}

function closeConnectMenu() {
  removeConnectPreviewEdge()
  showConnectMenu.value = false
  connectSourceNodeId.value = ''
  connectDropPoint.value = null
  connectReleasePoint.value = null
}

function closeAddMenu() {
  showAddMenu.value = false
  addMenuDropPoint.value = null
}

function toggleProjectMenu() {
  showProjectMenu.value = !showProjectMenu.value
}

function closeProjectMenu() {
  showProjectMenu.value = false
}

function closeZoomMenu() {
  showZoomMenu.value = false
}

function toggleZoomMenu() {
  showZoomMenu.value = !showZoomMenu.value
}

function applyZoomAfterChange() {
  syncZoom()
  updateNodeToolbar()
}

function zoomToScale(scale: number) {
  const g = graph.value
  if (!g) return
  const clamped = Math.min(CANVAS_MAX_ZOOM, Math.max(CANVAS_MIN_ZOOM, scale))
  g.zoomTo(clamped)
  applyZoomAfterChange()
}

function zoomFitToScreen() {
  const g = graph.value
  if (!g) return
  g.zoomToFit({
    padding: 48,
    maxScale: CANVAS_MAX_ZOOM,
    minScale: CANVAS_MIN_ZOOM,
  })
  applyZoomAfterChange()
}

function onZoomMenuAction(
  action: 'in' | 'out' | 'fit' | 'preset',
  preset?: (typeof ZOOM_MENU_PRESETS)[number],
) {
  if (action === 'in') zoomIn()
  else if (action === 'out') zoomOut()
  else if (action === 'fit') zoomFitToScreen()
  else if (preset != null) zoomToScale(preset)
  closeZoomMenu()
}

function selectProject(projectId: string) {
  activeProjectId.value = projectId
  closeProjectMenu()
}

function handleSaveCanvas() {
  const g = graph.value
  if (!g) return

  const snapshot: CanvasSnapshot = getCanvasSnapshot(g, {
    projectId: activeProjectId.value,
    projectName: currentProjectName.value,
    canvasBgTheme: canvasBgTheme.value,
    gridVisible: gridVisible.value,
    panMode: panMode.value,
    showMinimap: showMinimap.value,
  })

  saveCanvasSnapshotToStorage(snapshot)

  const project = canvasProjects.value.find((item) => item.id === activeProjectId.value)
  if (project) {
    project.saved = true
  }

  console.info('[Canvas] saved snapshot', snapshot)
}

function handleExportCanvas() {
  const g = graph.value
  if (!g) return

  const snapshot = getCanvasSnapshot(g, {
    projectId: activeProjectId.value,
    projectName: currentProjectName.value,
    canvasBgTheme: canvasBgTheme.value,
    gridVisible: gridVisible.value,
    panMode: panMode.value,
    showMinimap: showMinimap.value,
  })

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${activeProjectId.value || 'canvas'}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function openAddMenuAtGraphPoint(graphPoint: { x: number; y: number }) {
  const g = graph.value
  const overlayRoot = canvasRef.value
  if (!g || !overlayRoot) return

  closeConnectMenu()
  addMenuDropPoint.value = graphPoint

  const offset = graphLocalToContainerOffset(g, graphPoint.x, graphPoint.y, overlayRoot)
  const rect = overlayRoot.getBoundingClientRect()
  const menuWidth = 220
  const menuHeight = 420
  addMenuPos.value = {
    left: Math.max(12, Math.min(offset.left, rect.width - menuWidth - 12)),
    top: Math.max(60, Math.min(offset.top, rect.height - menuHeight - 12)),
  }
  showAddMenu.value = true
}

function updateAddMenuPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const drop = addMenuDropPoint.value
  if (!g || !overlayRoot || !showAddMenu.value || !drop) return

  const offset = graphLocalToContainerOffset(g, drop.x, drop.y, overlayRoot)
  const rect = overlayRoot.getBoundingClientRect()
  const menuWidth = 220
  const menuHeight = 420
  addMenuPos.value = {
    left: Math.max(12, Math.min(offset.left, rect.width - menuWidth - 12)),
    top: Math.max(60, Math.min(offset.top, rect.height - menuHeight - 12)),
  }
}

function updateConnectMenuPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const release = connectReleasePoint.value
  if (!g || !overlayRoot || !showConnectMenu.value || !release) return

  const source = g.getCellById(connectSourceNodeId.value)
  if (!source?.isNode()) return

  const { left, top } = getConnectMenuPosition(g, source as Node, overlayRoot, release)
  connectMenuPos.value = { left, top }
  syncConnectPreviewEdgeTarget()
}

function openConnectMenu(source: Node, releasePoint: { x: number; y: number }) {
  const g = graph.value
  const overlayRoot = canvasRef.value
  if (!g || !overlayRoot) return

  closeAddMenu()
  connectSourceNodeId.value = source.id
  connectReleasePoint.value = releasePoint
  const { left, top, dropPoint } = getConnectMenuPosition(
    g,
    source,
    overlayRoot,
    releasePoint,
  )
  connectDropPoint.value = dropPoint
  connectMenuPos.value = { left, top }
  showConnectMenu.value = true
  ;(g as CanvasGraph).__suppressBlankCloseForConnect = true
  nextTick(() => syncConnectPreviewEdgeTarget())
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
    if (data.kind === 'text') {
      loadPromptBarContext(spawned.id)
    }
  }

  finishConnectSpawn(spawned)
}

function openConnectMenuByNodeId(nodeId: string, releasePoint: { x: number; y: number }) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  openConnectMenu(cell as Node, releasePoint)
}

provide('openConnectMenuByNodeId', openConnectMenuByNodeId)

function getEdgeReleasePoint(edge: Edge) {
  const target = edge.getTarget()
  if (target && typeof target === 'object' && 'x' in target && 'y' in target) {
    return { x: Number(target.x), y: Number(target.y) }
  }
  return null
}

function handleEdgeConnected({
  edge,
  isNew,
  currentCell,
  currentPoint,
}: {
  edge: Edge
  isNew?: boolean
  currentCell?: { isNode?: () => boolean } | null
  currentPoint?: { x: number; y: number } | null
}) {
  if (!isNew) return

  const g = graph.value
  if (!g) return

  if (currentCell?.isNode?.()) {
    const target = currentCell as Node
    const targetData = target.getData() as CanvasNodeData
    if (targetData.kind === 'text') {
      syncTextNodeImageSource(g, target)
      if (activePickerNodeId.value === target.id) {
        loadPromptBarContext(target.id)
      }
      bumpToolbarRevision()
      scheduleHistoryPush()
    }
    return
  }

  const source = edge.getSourceCell()
  if (!source?.isNode() || !canOpenConnectMenu(source as Node)) {
    g.removeEdge(edge.id)
    return
  }

  const canvasGraph = g as CanvasGraph
  if (canvasGraph.__connectPreviewEdgeId === edge.id && showConnectMenu.value) return

  const releasePoint = currentPoint ?? getEdgeReleasePoint(edge)
  if (!releasePoint) return

  canvasGraph.__connectPreviewEdgeId = edge.id
  openConnectMenu(source as Node, releasePoint)
}

function removeNodeById(nodeId: string) {
  const g = graph.value
  if (!g || !nodeId) return

  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return

  g.removeCell(cell)
  textEditorApis.delete(nodeId)
  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = ''
    selectedKind.value = null
    syncNodeSelectionHighlight('')
  }
  if (activePickerNodeId.value === nodeId) {
    activePickerNodeId.value = ''
  }
  if (activeImageGenPromptNodeId.value === nodeId) {
    closeImageGenPromptBar()
  }
  if (activeVideoGenPromptNodeId.value === nodeId) {
    closeVideoGenPromptBar()
  }
  syncNodeCount()
  scheduleHistoryPush()
}

provide('deleteCanvasNode', removeNodeById)

function openTextExpand(nodeId: string) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = cell.getData() as CanvasNodeData
  textExpandNodeId.value = nodeId
  textExpandTitle.value = data.title || '文本节点'
  textExpandOpen.value = true
  nextTick(() => {
    const el = textExpandEditorRef.value
    if (!el) return
    el.innerHTML = data.content || ''
    el.focus()
  })
}

function closeTextExpand() {
  persistTextExpandContent()
  textExpandOpen.value = false
  textExpandNodeId.value = ''
}

function onTextExpandInput() {
  persistTextExpandContent()
}

function persistTextExpandContent() {
  const g = graph.value
  const nodeId = textExpandNodeId.value
  const el = textExpandEditorRef.value
  if (!g || !nodeId || !el) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = { ...(cell.getData() as CanvasNodeData), content: el.innerHTML }
  cell.setData(data)
}

function onTextFormatAction(cmd: TextFormatCommand) {
  const api = textEditorApis.get(selectedNodeId.value)
  if (!api) return
  if (cmd === 'expand') {
    openTextExpand(selectedNodeId.value)
    return
  }
  api.execFormat(cmd)
}

function downloadSelectedTextNode() {
  const api = textEditorApis.get(selectedNodeId.value)
  const text = api?.getPlainText() ?? ''
  if (!text.trim()) return
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${getSelectedNodeData()?.title || '文本节点'}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

function handleTextPickerAction(key: string, nodeId: string) {
  const g = graph.value
  if (!g) return

  selectedNodeId.value = nodeId
  selectedKind.value = 'text'
  syncNodeSelectionHighlight(nodeId)

  if (key === 'text2video') {
    activePickerNodeId.value = nodeId
    const source = g.getCellById(nodeId)
    if (!source?.isNode()) return
    const bbox = (source as Node).getBBox()
    const spawned = createNodeFromConnectMenu(
      g,
      source as Node,
      { x: bbox.x + bbox.width + 100, y: bbox.y + bbox.height / 2 },
      'video',
    )
    if (spawned) {
      finishConnectSpawn(spawned)
      openVideoGenPromptBar(spawned.id, 'text2video')
    }
    updateNodeToolbar()
    return
  }

  if (key === 'img2prompt') {
    const cell = g.getCellById(nodeId)
    if (!cell?.isNode()) return
    const node = cell as Node
    syncTextNodeImageSource(g, node)
    const data = { ...(node.getData() as CanvasNodeData) }
    data.textPickerTask = 'img2prompt'
    if (!data.genPrompt?.trim()) {
      data.genPrompt = IMG2PROMPT_DEFAULT_INSTRUCTION
    }
    node.setData(data)
    modelType.value = 'img2prompt'
    activePickerNodeId.value = nodeId
    loadPromptBarContext(nodeId)
    bumpToolbarRevision()
    updateNodeToolbar()
    return
  }

  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = { ...(cell.getData() as CanvasNodeData) }
  data.content = ''
  data.mode = 'editor'
  cell.setData(data)
  bumpToolbarRevision()
  updateNodeToolbar()
}

function handleTextNodeEdgeLinked(textNodeId: string) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(textNodeId)
  if (!cell?.isNode()) return
  syncTextNodeImageSource(g, cell as Node)
  if (activePickerNodeId.value === textNodeId) {
    loadPromptBarContext(textNodeId)
  }
  bumpToolbarRevision()
  updateNodeToolbar()
  scheduleHistoryPush()
}

function syncNodeCount() {
  nodeCount.value = graph.value?.getNodes().length ?? 0
  if (nodeCount.value === 0) {
    activePickerNodeId.value = ''
    closeImageGenPromptBar()
    closeVideoGenPromptBar()
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
  if (!g) return { x: 400, y: 320 }
  return getViewportCenterLocal(g)
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

function updatePromptBarPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const id = activePickerNodeId.value
  if (!g || !overlayRoot || !id) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return

  promptPos.value = getNodePromptPosition(g, cell as Node, overlayRoot)
}

function updateTextFormatToolbarPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const id = selectedNodeId.value
  if (!g || !overlayRoot || !id) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return
  const data = cell.getData() as CanvasNodeData
  if (data.kind !== 'text' || data.mode !== 'editor') return

  textFormatToolbarPos.value = getNodeTextFormatToolbarPosition(g, cell as Node, overlayRoot)
  textDownloadPos.value = getNodeTextDownloadPosition(g, cell as Node, overlayRoot)
}

function updateImageGenPromptBarPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const id = activeImageGenPromptNodeId.value
  if (!g || !overlayRoot || !id) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return

  imageGenPromptPos.value = getNodeImageGenPromptPosition(g, cell as Node, overlayRoot)
}

function updateVideoGenPromptBarPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const id = activeVideoGenPromptNodeId.value
  if (!g || !overlayRoot || !id) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return

  videoGenPromptPos.value = getNodeVideoGenPromptPosition(g, cell as Node, overlayRoot)
}

function updateNodeToolbar() {
  updatePromptBarPosition()
  updateTextFormatToolbarPosition()
  updateImageGenPromptBarPosition()
  updateVideoGenPromptBarPosition()
  updateAddMenuPosition()
  updateConnectMenuPosition()

  const g = graph.value
  const overlayRoot = canvasRef.value
  const id = selectedNodeId.value
  if (!g || !overlayRoot || !id) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return

  const data = cell.getData() as CanvasNodeData
  selectedKind.value = data.kind
  const node = cell as Node
  toolbarPos.value = getNodeToolbarPosition(g, node, overlayRoot)
  dialoguePos.value = getNodeDialoguePosition(g, node, overlayRoot)
  if (showImageCrop.value) {
    imageCropPos.value = getNodeCropOverlayPosition(g, node, overlayRoot)
  }
  if (data.kind === 'video' && showVideoHdPanel.value) {
    videoHdPos.value = getNodeSidePanelPosition(g, node, overlayRoot)
  }
}

function addNode(kind: NodeKind, point?: { x: number; y: number }) {
  const g = graph.value
  if (!g) return

  const position = point ?? addMenuDropPoint.value ?? getGraphCenter()
  const node = addCanvasNode(g, kind, position)
  const data = node.getData() as CanvasNodeData

  if (data.mode === 'picker' && (kind === 'text' || kind === 'audio')) {
    activePickerNodeId.value = node.id
    if (kind === 'text') {
      loadPromptBarContext(node.id)
    }
  }

  selectedNodeId.value = node.id
  updateNodeToolbar()
  closeAddMenu()
  syncNodeCount()
  scheduleHistoryPush()
  return node
}

function addFromMenu(kind: NodeKind) {
  const drop = addMenuDropPoint.value
  if (drop) {
    addNode(kind, drop)
    return
  }

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
    closeAddMenu()
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
    const created = addNode(kind, addMenuDropPoint.value ?? undefined)
    if (!created) return
    node = created
  } else {
    const data = { ...(node.getData() as CanvasNodeData) }
    data.mode = 'editor'
    node.setData(data)
  }

  pendingUploadNodeId.value = ''
  addMenuDropPoint.value = null
  selectedNodeId.value = node.id
  runUploadSimulation(node, file)
  updateNodeToolbar()
  scheduleHistoryPush()
}

function toggleAddMenu() {
  if (showAddMenu.value) {
    closeAddMenu()
    return
  }

  addMenuDropPoint.value = null
  const overlayRoot = canvasRef.value
  if (overlayRoot) {
    const rect = overlayRoot.getBoundingClientRect()
    addMenuPos.value = {
      left: rect.width / 2,
      top: rect.height - 120,
    }
  }
  showAddMenu.value = true
  showAssetsPanel.value = false
  closeHistoryPanel()
  closeConnectMenu()
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
    closeHistoryPanel()
    openAssetsPanel()
  }
}

function closeHistoryPanel() {
  showHistoryPanel.value = false
}

function toggleHistoryPanel() {
  if (showHistoryPanel.value) {
    closeHistoryPanel()
    return
  }
  showHistoryPanel.value = true
  showAssetsPanel.value = false
  closeAddMenu()
  closeConnectMenu()
  closeShortcutsPanel()
  closeZoomMenu()
}

function closeShortcutsPanel() {
  showShortcutsPanel.value = false
}

function toggleShortcutsPanel() {
  showShortcutsPanel.value = !showShortcutsPanel.value
  if (!showShortcutsPanel.value) return
  showZoomMenu.value = false
  closeAddMenu()
  closeConnectMenu()
  showAssetsPanel.value = false
  closeHistoryPanel()
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
  applyZoomAfterChange()
}

function zoomOut() {
  graph.value?.zoom(-0.12)
  applyZoomAfterChange()
}

function removeSelectedNode() {
  const id = selectedNodeId.value
  if (!id) return
  removeNodeById(id)
}

function handleBlankDblClick(event: { x: number; y: number }) {
  openAddMenuAtGraphPoint({ x: event.x, y: event.y })
}

function handleNodeClick({ node, e }: { node: Node; e?: MouseEvent }) {
  const data = node.getData() as CanvasNodeData
  const multiSelect = Boolean(e?.ctrlKey || e?.metaKey)

  selectedNodeId.value = node.id
  selectedKind.value = data.kind

  if (multiSelect) {
    syncNodeSelectionHighlight(node.id)
    updateNodeToolbar()
    return
  }

  resetImageToolbarMore()
  resetImageDialogue()
  resetImageCrop()
  resetVideoDialogue()
  resetVideoHdPanel()
  resetVideoFramesPanel()
  bumpToolbarRevision()

  const showImageGenPrompt =
    data.kind === 'image' &&
    data.imageGenTask === 'img2img'

  const showVideoGenPrompt =
    data.kind === 'video' &&
    data.mode === 'picker' &&
    data.uploadState !== 'uploading'

  if (showImageGenPrompt) {
    openImageGenPromptBar(node.id)
  } else if (showVideoGenPrompt) {
    openVideoGenPromptBar(node.id, data.videoGenTab ?? 'text2video')
  } else {
    closeImageGenPromptBar()
    closeVideoGenPromptBar()
    activePickerNodeId.value =
      data.mode === 'picker' && (data.kind === 'text' || data.kind === 'audio') ? node.id : ''
    if (activePickerNodeId.value && data.kind === 'text') {
      loadPromptBarContext(node.id)
    }
  }

  syncNodeSelectionHighlight(node.id)
  updateNodeToolbar()
}

function handleNodeUnselected() {
  activePickerNodeId.value = ''
  closeImageGenPromptBar()
  closeVideoGenPromptBar()
}

function handleBlankClick() {
  closeAddMenu()
  closeProjectMenu()
  closeUserMenu()
  closeZoomMenu()
  closeShortcutsPanel()
  closeHistoryPanel()
  const g = graph.value as CanvasGraph | null
  if (g?.__suppressBlankCloseForConnect) {
    g.__suppressBlankCloseForConnect = false
  } else {
    closeConnectMenu()
  }
  selectedNodeId.value = ''
  selectedKind.value = null
  resetImageToolbarMore()
  resetImageDialogue()
  resetImageCrop()
  resetVideoDialogue()
  resetVideoHdPanel()
  resetVideoFramesPanel()
  closeImageGenPromptBar()
  closeVideoGenPromptBar()
  closeTextExpand()
  syncNodeSelectionHighlight('')
}

function handleNodeDataChange({ node }: { node: Node }) {
  const data = node.getData() as CanvasNodeData
  if (data.mode === 'editor' && activePickerNodeId.value === node.id) {
    activePickerNodeId.value = ''
  }
  if (activePickerNodeId.value === node.id && data.kind === 'text') {
    promptSourcePreviewUrl.value = data.sourcePreviewUrl ?? ''
    promptSourceFileName.value = data.sourceFileName ?? ''
  }
  if (selectedNodeId.value === node.id) {
    selectedKind.value = data.kind
    bumpToolbarRevision()
    updateNodeToolbar()
  }
}

function getHistoryMeta() {
  return {
    projectId: activeProjectId.value,
    projectName: currentProjectName.value,
    canvasBgTheme: canvasBgTheme.value,
    gridVisible: gridVisible.value,
    panMode: panMode.value,
    showMinimap: showMinimap.value,
  }
}

function syncHistoryState() {
  canUndo.value = canvasHistory?.canUndo() ?? false
  canRedo.value = canvasHistory?.canRedo() ?? false
}

function scheduleHistoryPush() {
  const g = graph.value
  if (!g || !canvasHistory) return
  if (historyPushTimer) clearTimeout(historyPushTimer)
  historyPushTimer = setTimeout(() => {
    canvasHistory?.push(g)
    syncHistoryState()
    historyPushTimer = null
  }, 280)
}

function handleUndo() {
  const g = graph.value
  if (!g || !canvasHistory?.undo(g)) return
  syncHistoryState()
  syncNodeCount()
  handleBlankClick()
  nextTick(() => updateNodeToolbar())
}

function handleRedo() {
  const g = graph.value
  if (!g || !canvasHistory?.redo(g)) return
  syncHistoryState()
  syncNodeCount()
  handleBlankClick()
  nextTick(() => updateNodeToolbar())
}

function copySelectedNode() {
  const g = graph.value
  const id = selectedNodeId.value
  if (!g || !id) return
  const cell = g.getCellById(id)
  if (!cell?.isNode()) return
  nodeClipboard.value = (cell as Node).toJSON()
}

function pasteNode() {
  const g = graph.value
  const payload = nodeClipboard.value
  if (!g || !payload) return

  const source = g.getCellById(String(payload.id ?? ''))
  let node: Node
  if (source?.isNode()) {
    node = (source as Node).clone() as Node
    const pos = node.getPosition()
    node.position(pos.x + 32, pos.y + 32)
    g.addCell(node)
  } else {
    const { id: _removed, x, y, ...rest } = payload
    node = g.addNode({
      ...rest,
      x: (typeof x === 'number' ? x : 0) + 32,
      y: (typeof y === 'number' ? y : 0) + 32,
    })
  }

  const data = node.getData() as CanvasNodeData
  node.setData({ ...data, isSelected: true })

  selectedNodeId.value = node.id
  selectedKind.value = data.kind
  syncNodeSelectionHighlight(node.id)
  updateNodeToolbar()
  syncNodeCount()
  scheduleHistoryPush()
}

function getSelectedNode() {
  const g = graph.value
  const id = selectedNodeId.value
  if (!g || !id) return null
  const cell = g.getCellById(id)
  return cell?.isNode() ? (cell as Node) : null
}

function moveNodeLayer(step: 'front' | 'back' | 'forward' | 'backward') {
  const g = graph.value
  const node = getSelectedNode()
  if (!g || !node) return

  if (step === 'front') {
    node.toFront()
  } else if (step === 'back') {
    node.toBack()
  } else {
    const nodes = g
      .getNodes()
      .slice()
      .sort((a, b) => (a.getZIndex() ?? 0) - (b.getZIndex() ?? 0))
    const idx = nodes.findIndex((n) => n.id === node.id)
    const targetIdx = step === 'forward' ? idx + 1 : idx - 1
    const current = nodes[idx]
    const target = nodes[targetIdx]
    if (!current || !target || targetIdx < 0 || targetIdx >= nodes.length) return
    const zA = current.getZIndex() ?? 0
    const zB = target.getZIndex() ?? 0
    current.setZIndex(zB)
    target.setZIndex(zA)
  }
  scheduleHistoryPush()
}

function openImagePreview() {
  const node = getSelectedNode()
  if (!node) return
  const data = node.getData() as CanvasNodeData
  if (data.kind !== 'image' || !data.previewUrl) return
  imagePreviewUrl.value = data.previewUrl
}

function closeImagePreview() {
  imagePreviewUrl.value = ''
}

function cancelCurrentOperation() {
  if (imagePreviewUrl.value) {
    closeImagePreview()
    return true
  }
  if (showShortcutsPanel.value) {
    closeShortcutsPanel()
    return true
  }
  if (showImageCrop.value) {
    closeImageCrop()
    return true
  }
  if (showConnectMenu.value) {
    closeConnectMenu()
    return true
  }
  if (showAddMenu.value) {
    closeAddMenu()
    return true
  }
  if (showProjectMenu.value) {
    closeProjectMenu()
    return true
  }
  if (showUserMenu.value) {
    closeUserMenu()
    return true
  }
  if (showZoomMenu.value) {
    closeZoomMenu()
    return true
  }
  if (showAssetsPanel.value) {
    showAssetsPanel.value = false
    return true
  }
  if (showHistoryPanel.value) {
    closeHistoryPanel()
    return true
  }
  if (showImageDialogue.value) {
    resetImageDialogue()
    return true
  }
  if (showVideoDialogue.value || showVideoHdPanel.value || showVideoFramesPanel.value) {
    resetVideoDialogue()
    resetVideoHdPanel()
    resetVideoFramesPanel()
    return true
  }
  if (selectedNodeId.value) {
    handleBlankClick()
    return true
  }
  return false
}

function triggerCanvasUploadShortcut() {
  pendingUploadNodeId.value = ''
  addMenuDropPoint.value = getGraphCenter()
  fileInputRef.value?.click()
}

const { altVoiceTimer, bindKeyboard, unbindKeyboard, endSpacePan } = useCanvasKeyboard({
  graph,
  panMode,
  selectedNodeId,
  cancelCurrentOperation,
  zoomIn,
  zoomOut,
  zoomToScale,
  zoomFitToScreen,
  handleSaveCanvas,
  copySelectedNode,
  pasteNode,
  handleUndo,
  handleRedo,
  moveNodeLayer,
  openImageDialogue,
  getSelectedNode,
  removeSelectedNode,
  openImagePreview,
  triggerCanvasUploadShortcut,
  getScroller,
})

function bindScrollerScrollListener(g: Graph) {
  const scroller = getScroller(g)
  if (!scroller) return
  scrollerScrollTarget = scroller.container
  scrollerScrollTarget.addEventListener('scroll', updateNodeToolbar, { passive: true })
}

function unbindScrollerScrollListener() {
  if (!scrollerScrollTarget) return
  scrollerScrollTarget.removeEventListener('scroll', updateNodeToolbar)
  scrollerScrollTarget = null
}

onMounted(() => {
  if (!graphRef.value) return

  const instance = createGraph(graphRef.value) as CanvasGraph
  instance.__openConnectMenu = openConnectMenuByNodeId
  instance.__openImageDialogue = openImageDialogue
  instance.__deleteCanvasNode = removeNodeById
  instance.__requestTextExpand = openTextExpand
  instance.__onTextPickerAction = handleTextPickerAction
  instance.__onTextNodeEdgeLinked = handleTextNodeEdgeLinked
  instance.__notifyTextNodeUpdated = bumpToolbarRevision
  instance.__textEditorRegistry = {
    register(nodeId: string, api: TextEditorApi) {
      textEditorApis.set(nodeId, api)
    },
    unregister(nodeId: string) {
      textEditorApis.delete(nodeId)
    },
    get(nodeId: string) {
      return textEditorApis.get(nodeId)
    },
  }
  graph.value = instance
  bindGraphInteraction(instance)
  bindScrollerScrollListener(instance)
  bindKeyboard()

  // 挂载即把全画布各层背景刷成当前主题色，避免拖拽到内容区外露出建图时的深色底（视图分层感）
  applyCanvasBgTheme(instance, canvasBgTheme.value, gridVisible.value)

  instance.on('blank:dblclick', handleBlankDblClick)
  instance.on('scale', ({ sx }) => {
    syncZoom(sx)
    requestAnimationFrame(() => updateNodeToolbar())
  })
  instance.on('translate', updateNodeToolbar)
  instance.on('node:moving', updateNodeToolbar)
  instance.on('node:moved', () => {
    updateNodeToolbar()
    scheduleHistoryPush()
  })
  instance.on('node:added', syncNodeCount)
  instance.on('node:removed', syncNodeCount)
  instance.on('node:click', handleNodeClick)
  instance.on('node:dblclick', ({ node }) => {
    const data = node.getData() as CanvasNodeData
    if (data.kind === 'image') {
      handleImageNodeDblClick({ node })
      return
    }
    if (data.kind === 'text' && data.mode === 'picker') {
      node.setData({ ...data, mode: 'editor' })
      selectedNodeId.value = node.id
      selectedKind.value = 'text'
      syncNodeSelectionHighlight(node.id)
      bumpToolbarRevision()
      updateNodeToolbar()
    }
  })
  instance.on('blank:click', () => {
    handleBlankClick()
    handleNodeUnselected()
  })
  instance.on('node:change:data', handleNodeDataChange)
  instance.on('edge:connected', handleEdgeConnected)

  canvasHistory = createCanvasHistory(getHistoryMeta)
  canvasHistory.seed(instance)
  syncHistoryState()

  const scroller = getScroller(instance)
  scroller?.togglePanning(panMode.value)

  syncZoom()
  syncNodeCount()

  nextTick(() => {
    syncAllNodeSizes(instance)
    refreshCanvasNodeViews(instance)
    ensureInfiniteCanvasArea(instance, { recenter: true })
  })

  if (showMinimap.value) {
    nextTick(() => setupMinimap())
  }
})

onBeforeUnmount(() => {
  unbindKeyboard()
  if (historyPushTimer) clearTimeout(historyPushTimer)
  if (altVoiceTimer.value) clearTimeout(altVoiceTimer.value)
  endSpacePan()
  canvasHistory = null
  unbindScrollerScrollListener()
  teardownMinimap()
  graph.value?.dispose()
  graph.value = null
})
</script>

<style lang="scss">
/* 子组件在 panels/ 中，样式须为非 scoped 才能作用于子组件 DOM */
@import './index.scss';
</style>
