<template>
  <div
    class="image-gen-node"
    :class="{
      'image-gen-node--selected': data.isSelected,
      'image-gen-node--img2img': data.imageGenTask === 'img2img',
    }"
  >
    <button
      type="button"
      class="node-port-plus"
      title="添加连线节点"
      @mousedown.stop="onPlusPointerDown"
    >
      +
    </button>
    <button
      v-if="data.imageGenTask === 'picker'"
      type="button"
      class="image-gen-node__upload-btn"
      @mousedown.stop
      @click="triggerUpload"
    >
      ↑ 上传
    </button>

    <div class="image-gen-node__meta canvas-node__meta">
      <span class="image-gen-node__title">
        <span v-if="data.imageGenTask === 'img2img'" class="image-gen-node__title-icon">图</span>
        <span class="image-gen-node__title-text">{{ headerTitle }}</span>
      </span>
      <span v-if="data.imageGenTask === 'img2img' && data.inputUpdated" class="image-gen-node__status">
        ① 输入已更新
      </span>
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

    <div class="image-gen-node__body">
      <div
        v-if="data.imageGenTask === 'picker'"
        class="image-gen-node__picker"
      >
        <div
          class="image-gen-node__preview image-gen-node__preview--empty"
          @click="triggerUpload"
        >
          <span class="image-gen-node__placeholder-icon" aria-hidden="true" />
        </div>
        <p class="image-gen-node__try">尝试：</p>
        <button
          v-for="action in IMAGE_GEN_ACTIONS"
          :key="action.key"
          type="button"
          class="image-gen-node__action"
          @mousedown.stop
          @click="onPickerAction(action.key)"
        >
          <span class="image-gen-node__action-icon" :data-icon="action.icon" />
          {{ action.label }}
        </button>
      </div>

      <template v-else-if="data.imageGenTask === 'img2img'">
        <div class="image-gen-node__preview image-gen-node__preview--output">
          <img v-if="data.previewUrl" :src="data.previewUrl" :alt="data.fileName" />
          <span v-else class="image-gen-node__placeholder-icon image-gen-node__placeholder-icon--lg" aria-hidden="true" />
        </div>

        <div class="image-gen-node__prompt" @mousedown.stop>
          <div class="image-gen-node__prompt-tags">
            <button
              v-for="tag in IMG2IMG_QUICK_TAGS"
              :key="tag"
              type="button"
              class="image-gen-node__tag"
            >
              {{ tag }}
            </button>
            <span
              v-if="data.sourcePreviewUrl"
              class="image-gen-node__ref-thumb"
            >
              <img :src="data.sourcePreviewUrl" alt="" />
            </span>
          </div>
          <textarea
            v-model="promptModel"
            class="image-gen-node__prompt-input"
            :placeholder="IMG2IMG_PROMPT_PLACEHOLDER"
            rows="2"
            @mousedown.stop
          />
          <div class="image-gen-node__prompt-footer">
            <button type="button" class="image-gen-node__model">Lib Nero Pro ▾</button>
            <button type="button" class="image-gen-node__ratio">16:9 · 2K</button>
            <span class="image-gen-node__prompt-icons">
              <button type="button" title="相机">📷</button>
              <button type="button" title="增强">✦</button>
            </span>
            <span class="image-gen-node__count">1张</span>
            <input
              v-model.number="seedModel"
              type="number"
              class="image-gen-node__seed"
              min="0"
              max="999"
            />
            <button type="button" class="image-gen-node__send" title="生成">↑</button>
          </div>
        </div>
      </template>

      <div v-else class="image-gen-node__picker">
        <div class="image-gen-node__preview image-gen-node__preview--empty">
          <span class="image-gen-node__placeholder-icon" aria-hidden="true" />
        </div>
        <p class="image-gen-node__hd-hint">图片高清处理中…</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive } from 'vue'
import type { Node } from '@antv/x6'
import {
  IMAGE_GEN_ACTIONS,
  IMG2IMG_PROMPT_PLACEHOLDER,
  IMG2IMG_QUICK_TAGS,
  type CanvasNodeData,
  type ImageGenTask,
} from '../constants'
import { createEmptyNodeData } from '../constants'
import { useNodeDelete } from './useNodeDelete'
import { useNodeConnect } from './useNodeConnect'

const getNode = inject<() => Node>('getNode')!
const requestCanvasUpload = inject<(nodeId: string) => void>('requestCanvasUpload')
const applyImageGenTask = inject<(nodeId: string, task: ImageGenTask) => void>('applyImageGenTask')
const { removeSelf } = useNodeDelete()
const { onPlusPointerDown } = useNodeConnect()

const data = reactive<CanvasNodeData>({
  ...createEmptyNodeData(),
  kind: 'image',
  title: '图片节点',
  mode: 'picker',
  imageGenTask: 'picker',
})

const headerTitle = computed(() => {
  if (data.imageGenTask === 'img2img') return '图生图'
  if (data.imageGenTask === 'hd') return '图片高清'
  return data.title
})

const promptModel = computed({
  get: () => data.genPrompt ?? '',
  set: (value: string) => {
    data.genPrompt = value
    persist()
  },
})

const seedModel = computed({
  get: () => data.genSeed ?? 58,
  set: (value: number) => {
    data.genSeed = value
    persist()
  },
})

function persist() {
  getNode().setData({ ...data })
}

function triggerUpload() {
  requestCanvasUpload?.(getNode().id)
}

function onPickerAction(key: ImageGenTask) {
  if (key === 'picker') return
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

.image-gen-node {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f3f4f6;
  pointer-events: auto;
}

.image-gen-node__upload-btn {
  position: absolute;
  top: -36px;
  right: 0;
  z-index: 2;
  padding: 6px 12px;
  border: 1px solid #4b4b55;
  border-radius: 8px;
  background: #252528;
  color: #e5e7eb;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #2a2a30;
  }
}

.image-gen-node__meta {
  margin-bottom: 6px;
  font-size: 12px;
}

.image-gen-node__title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  color: #9ca3af;
}

.image-gen-node__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #3d3d45;
  font-size: 10px;
  color: #d1d5db;
}

.image-gen-node__title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-gen-node__status {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 11px;
}

.image-gen-node__body {
  display: flex;
  flex-direction: column;
  height: calc(100% - 24px);
  padding: 10px;
  border: 1px solid #4b4b55;
  border-radius: 14px;
  background: #1e1e22;
  box-sizing: border-box;
}

.image-gen-node--img2img .image-gen-node__body {
  gap: 10px;
}

.image-gen-node__picker {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.image-gen-node__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #141416;
  overflow: hidden;

  &--empty {
    flex: 1;
    min-height: 140px;
    cursor: pointer;
  }

  &--output {
    flex: 1;
    min-height: 180px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.image-gen-node__placeholder-icon {
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

  &--lg {
    width: 64px;
    height: 52px;
  }
}

.image-gen-node__try {
  margin: 12px 0 8px;
  font-size: 12px;
  color: #6b7280;
}

.image-gen-node__action {
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

.image-gen-node__action-icon {
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

.image-gen-node__hd-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.image-gen-node__prompt {
  flex-shrink: 0;
  padding: 10px;
  border: 1px solid #3d3d45;
  border-radius: 12px;
  background: #18181c;
}

.image-gen-node__prompt-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.image-gen-node__tag {
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  background: #252528;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #2a2a30;
    color: #e5e7eb;
  }
}

.image-gen-node__ref-thumb {
  display: block;
  width: 28px;
  height: 28px;
  margin-left: auto;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #4b4b55;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-gen-node__prompt-input {
  width: 100%;
  min-height: 52px;
  margin-bottom: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 12px;
  line-height: 1.5;
  resize: none;
  outline: none;

  &::placeholder {
    color: #6b7280;
  }
}

.image-gen-node__prompt-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.image-gen-node__model,
.image-gen-node__ratio {
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  background: #252528;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #2a2a30;
    color: #e5e7eb;
  }
}

.image-gen-node__prompt-icons {
  display: flex;
  gap: 4px;

  button {
    padding: 4px 6px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #9ca3af;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background: #252528;
    }
  }
}

.image-gen-node__count {
  margin-left: auto;
  font-size: 11px;
  color: #6b7280;
}

.image-gen-node__seed {
  width: 40px;
  padding: 4px;
  border: 1px solid #3d3d45;
  border-radius: 6px;
  background: #252528;
  color: #e5e7eb;
  font-size: 11px;
  text-align: center;
}

.image-gen-node__send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #6b7cff;
  color: #fff;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: #5b6cff;
  }
}
</style>
