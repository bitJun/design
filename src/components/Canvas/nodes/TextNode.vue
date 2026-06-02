<template>
  <div class="text-node" :class="{ 'text-node--selected': data.isSelected }">
    <button
      type="button"
      class="node-port-plus"
      title="添加连线节点"
      @mousedown.stop="onPlusPointerDown"
    >
      +
    </button>
    <div class="text-node__title canvas-node__meta">
      <span class="text-node__title-icon">T</span>
      <span class="text-node__title-text">{{ data.title }}</span>
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

    <div v-if="data.mode === 'picker'" class="text-node__body text-node__body--picker">
      <div class="text-node__hero-icon">
        <span />
        <span />
        <span />
        <span />
      </div>
      <p class="text-node__try">尝试：</p>
      <button
        v-for="action in TEXT_PICKER_ACTIONS"
        :key="action.key"
        type="button"
        class="text-node__action"
        @mousedown.stop
        @click="onAction(action.key)"
      >
        <span class="text-node__action-icon" :data-icon="action.icon" />
        {{ action.label }}
      </button>
    </div>

    <div v-else class="text-node__body text-node__body--editor">
      <div class="text-node__format">
        <button type="button" class="text-node__format-btn">H1</button>
        <button type="button" class="text-node__format-btn">H2</button>
        <button type="button" class="text-node__format-btn">H3</button>
        <span class="text-node__format-divider" />
        <button type="button" class="text-node__format-btn">B</button>
        <button type="button" class="text-node__format-btn">I</button>
        <button type="button" class="text-node__format-btn">≡</button>
        <button type="button" class="text-node__format-btn">🔗</button>
      </div>
      <textarea
        v-model="data.content"
        class="text-node__textarea"
        placeholder="输入文本内容..."
        @input="syncData"
        @mousedown.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, reactive } from 'vue'
import type { Node } from '@antv/x6'
import { TEXT_PICKER_ACTIONS } from '../constants'
import type { CanvasNodeData } from '../constants'
import { createEmptyNodeData } from '../constants'
import { useNodeDelete } from './useNodeDelete'
import { useNodeConnect } from './useNodeConnect'

const getNode = inject<() => Node>('getNode')!
const { removeSelf } = useNodeDelete()
const { onPlusPointerDown } = useNodeConnect()

const data = reactive<CanvasNodeData>({
  ...createEmptyNodeData(),
  kind: 'text',
  title: '文本节点',
})

function syncData() {
  getNode().setData({ ...data })
}

function onAction(key: string) {
  if (key === 'write') {
    data.mode = 'editor'
    syncData()
    return
  }
  data.content = TEXT_PICKER_ACTIONS.find((item) => item.key === key)?.label ?? ''
  data.mode = 'editor'
  syncData()
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
.text-node {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f3f4f6;
  pointer-events: auto;
}

.text-node__title {
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.text-node__title-icon {
  flex-shrink: 0;
}

.text-node__title-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-node__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #3d3d45;
  font-size: 10px;
  font-weight: 700;
  color: #d1d5db;
}

.text-node__body {
  border: 1px solid #4b4b55;
  border-radius: 14px;
  background: #1e1e22;
  overflow: hidden;
}

.text-node__body--picker {
  padding: 20px 16px 16px;
}

.text-node__hero-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-bottom: 16px;

  span {
    display: block;
    height: 3px;
    border-radius: 2px;
    background: #6b7280;

    &:nth-child(1) { width: 36px; }
    &:nth-child(2) { width: 28px; }
    &:nth-child(3) { width: 32px; }
    &:nth-child(4) { width: 24px; }
  }
}

.text-node__try {
  margin: 0 0 8px;
  font-size: 12px;
  color: #6b7280;
}

.text-node__action {
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
  transition: background 0.15s;

  &:hover {
    background: #2a2a30;
  }
}

.text-node__action-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #3d3d45;
  flex-shrink: 0;

  &[data-icon='play']::after { content: '▶'; font-size: 10px; display: flex; justify-content: center; }
  &[data-icon='image']::after { content: '▣'; font-size: 10px; display: flex; justify-content: center; }
  &[data-icon='audio']::after { content: '♪'; font-size: 10px; display: flex; justify-content: center; }
  &[data-icon='doc']::after { content: '≡'; font-size: 10px; display: flex; justify-content: center; }
}

.text-node__body--editor {
  display: flex;
  flex-direction: column;
}

.text-node__format {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid #3d3d45;
  background: #252528;
}

.text-node__format-btn {
  min-width: 28px;
  height: 26px;
  padding: 0 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #d1d5db;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #3d3d45;
  }
}

.text-node__format-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: #3d3d45;
}

.text-node__textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  color: #f3f4f6;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  box-sizing: border-box;
}
</style>
