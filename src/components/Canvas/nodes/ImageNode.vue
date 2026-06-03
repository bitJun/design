<template>
  <div
    class="image-node"
    :class="{ 'image-node--portrait': isPortraitLayout, 'image-node--selected': data.isSelected }"
  >
    <button
      type="button"
      class="node-port-plus"
      title="添加连线节点"
      @mousedown.stop="onPlusPointerDown"
    >
      +
    </button>
    <div class="image-node__meta canvas-node__meta">
      <span class="image-node__title">
        <span class="image-node__title-icon">▣</span>
        <span class="image-node__title-text">{{ data.title }}</span>
      </span>
      <span v-if="dimensionLabel" class="image-node__size">{{ dimensionLabel }}</span>
      <button
        type="button"
        class="canvas-node__delete"
        title="删除节点"
        @mousedown.stop
        @click="removeSelf"
      >
        ×
      </button>
    </div>

    <div class="image-node__body">
      <div
        v-if="showPickerBody"
        class="image-node__picker"
      >
        <div
          class="image-node__preview image-node__preview--empty"
          @click="requestFile"
        >
          <span class="image-node__placeholder-icon" aria-hidden="true" />
        </div>
        <p class="image-node__try">尝试：</p>
        <button
          v-for="action in IMAGE_GEN_ACTIONS"
          :key="action.key"
          type="button"
          class="image-node__action"
          @mousedown.stop
          @click="onPickerAction(action.key)"
        >
          <span class="image-node__action-icon" :data-icon="action.icon" />
          {{ action.label }}
        </button>
      </div>

      <template v-else>
        <button
          v-if="data.previewUrl"
          type="button"
          class="image-node__scale-btn"
          :class="{ 'image-node__scale-btn--active': isResizing }"
          title="缩放视图"
          @mousedown.stop="startResize"
        >
          ↗
        </button>

        <div
          class="image-node__preview"
          :class="{ 'image-node__preview--uploading': data.uploadState === 'uploading' }"
          @click="requestFile"
        >
          <template v-if="data.uploadState === 'uploading'">
            <span class="image-node__spinner" />
            <span>上传中 ({{ data.uploadProgress }}%) ...</span>
          </template>
          <template v-else-if="data.previewUrl">
            <img :src="data.previewUrl" :alt="data.fileName" />
            <span v-if="showUploadSuccess" class="image-node__success">上传成功</span>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive } from 'vue'
import type { Node } from '@antv/x6'
import {
  formatDimensions,
  IMAGE_GEN_ACTIONS,
  isPortrait,
  type CanvasNodeData,
  type ImageGenTask,
} from '../constants'
import { createEmptyNodeData } from '../constants'
import { useNodeDelete } from './useNodeDelete'
import { useNodeConnect } from './useNodeConnect'
import { useNodeViewScale } from './useNodeViewScale'

const getNode = inject<() => Node>('getNode')!
const requestCanvasUpload = inject<(nodeId: string) => void>('requestCanvasUpload')
const applyImageGenTask = inject<(nodeId: string, task: ImageGenTask) => void>('applyImageGenTask')
const { removeSelf } = useNodeDelete()
const { onPlusPointerDown } = useNodeConnect()
const { startResize, previewScale, isResizing } = useNodeViewScale()

const data = reactive<CanvasNodeData>({ ...createEmptyNodeData(), kind: 'image', title: '图片节点', mode: 'editor' })

const dimensionLabel = computed(() => {
  const scale = previewScale.value ?? data.viewScale ?? 1
  const width = Math.round(data.mediaWidth * scale)
  const height = Math.round(data.mediaHeight * scale)
  return formatDimensions(width, height)
})
const isPortraitLayout = computed(() =>
  data.mediaWidth && data.mediaHeight
    ? isPortrait(data.mediaWidth, data.mediaHeight)
    : false,
)
const showUploadSuccess = computed(
  () => data.uploadState === 'done' && Boolean(data.previewUrl),
)
const showPickerBody = computed(
  () =>
    !data.previewUrl &&
    data.uploadState !== 'uploading' &&
    !data.imageGenTask,
)

function requestFile() {
  requestCanvasUpload?.(getNode().id)
}

function onPickerAction(key: ImageGenTask) {
  applyImageGenTask?.(getNode().id, key)
}

onMounted(() => {
  const node = getNode()
  Object.assign(data, node.getData() as CanvasNodeData)
  node.on('change:data', ({ current }) => {
    Object.assign(data, current as CanvasNodeData)
  })
})
</script>

<style scoped lang="scss">
@import './node-delete.scss';
@import './node-port-plus.scss';
.image-node {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f3f4f6;
  pointer-events: auto;
  overflow: visible;
}

.image-node__meta {
  margin-bottom: 6px;
  font-size: 12px;
}

.image-node__title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  color: #9ca3af;
}

.image-node__title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-node__size {
  color: #6b7280;
  font-size: 11px;
}

.image-node__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #3d3d45;
  font-size: 10px;
}

.image-node__body {
  position: relative;
  display: flex;
  flex-direction: column;
  height: calc(100% - 24px);
  padding: 10px;
  border: 1px solid #4b4b55;
  border-radius: 14px;
  background: #1e1e22;
  box-sizing: border-box;
}

.image-node__picker {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.image-node__try {
  margin: 12px 0 8px;
  font-size: 12px;
  color: #6b7280;
}

.image-node__action {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 6px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #e5e7eb;
  font-size: 13px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #2a2a30;
  }
}

.image-node__action-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: #3d3d45;

  &[data-icon='img2img']::after {
    content: '▣';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 11px;
    color: #9ca3af;
  }

  &[data-icon='hd']::after {
    content: 'HD';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 8px;
    font-weight: 700;
    color: #9ca3af;
  }
}

.image-node__scale-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #4b4b55;
  border-radius: 8px;
  background: rgba(30, 30, 34, 0.85);
  color: #e5e7eb;
  font-size: 12px;
  cursor: nwse-resize;
  touch-action: none;

  &:hover,
  &--active {
    background: #2a2a30;
    border-color: #6b7cff;
    color: #fff;
  }
}

.image-node__preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  min-height: 160px;
  border-radius: 10px;
  background: #141416;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  &--empty {
    flex: 1;
    min-height: 140px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-node--portrait .image-node__preview {
  min-height: 0;
}

.image-node__success {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 14px;
  pointer-events: none;
}

.image-node__placeholder-icon {
  width: 48px;
  height: 40px;
  border: 2px solid #4b5563;
  border-radius: 6px;
  opacity: 0.55;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    bottom: 8px;
    width: 14px;
    height: 10px;
    border-left: 2px solid #6b7280;
    border-bottom: 2px solid #6b7280;
    transform: skewX(-12deg);
  }

  &::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 10px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #6b7280;
  }
}

.image-node__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #3d3d45;
  border-top-color: #6b7cff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
