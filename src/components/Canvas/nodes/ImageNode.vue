<template>
  <div
    class="image-node"
    :class="{ 'image-node--portrait': isPortraitLayout, 'image-node--selected': data.isSelected }"
  >
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
      <button
        v-if="data.previewUrl"
        type="button"
        class="image-node__export-btn"
        title="导出"
        @mousedown.stop
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
        <template v-else>
          <span class="image-node__placeholder-icon">▣</span>
          <span>点击上传图片</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive } from 'vue'
import type { Node } from '@antv/x6'
import { formatDimensions, isPortrait } from '../constants'
import type { CanvasNodeData } from '../constants'
import { createEmptyNodeData } from '../constants'
import { useNodeDelete } from './useNodeDelete'

const getNode = inject<() => Node>('getNode')!
const requestCanvasUpload = inject<(nodeId: string) => void>('requestCanvasUpload')
const { removeSelf } = useNodeDelete()

const data = reactive<CanvasNodeData>({ ...createEmptyNodeData(), kind: 'image', title: '图片节点', mode: 'editor' })

const dimensionLabel = computed(() => formatDimensions(data.mediaWidth, data.mediaHeight))
const isPortraitLayout = computed(() =>
  data.mediaWidth && data.mediaHeight
    ? isPortrait(data.mediaWidth, data.mediaHeight)
    : false,
)
const showUploadSuccess = computed(
  () => data.uploadState === 'done' && Boolean(data.previewUrl),
)

function requestFile() {
  requestCanvasUpload?.(getNode().id)
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
.image-node {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f3f4f6;
  pointer-events: auto;
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
  height: calc(100% - 24px);
  padding: 10px;
  border: 1px solid #4b4b55;
  border-radius: 14px;
  background: #1e1e22;
  box-sizing: border-box;
}

.image-node__export-btn {
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
  cursor: pointer;

  &:hover {
    background: #2a2a30;
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
  font-size: 32px;
  opacity: 0.5;
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
