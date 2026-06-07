<template>
  <div :class="`canvas__toolbar canvas__toolbar--left  ${canvasBgTheme === 'light' ? 'bg_white' : ''}`">
    <button
      type="button"
      class="canvas__tool-btn"
      :class="{ 'canvas__tool-btn--active': showAddMenu }"
      title="添加节点"
      @click="emit('toggle-add-menu')"
    >
      +
    </button>
    <button
      type="button"
      class="canvas__tool-btn"
      :class="{ 'canvas__tool-btn--active': showAssetsPanel }"
      title="我的素材"
      @click="emit('toggle-assets-panel')"
    >
      ▤
    </button>
    <button
      type="button"
      class="canvas__tool-btn"
      title="工作流"
    >
      ⎔
    </button>
    <button
      type="button"
      class="canvas__tool-btn"
      :class="{ 'canvas__tool-btn--active': showHistoryPanel }"
      title="历史记录"
      @click="emit('toggle-history-panel')"
    >
      <span class="canvas__history-icon" aria-hidden="true" />
    </button>
    <a-popover placement="right">
      <template #content>
        <span>使用教程</span>
      </template>
      <button
        type="button"
        class="canvas__tool-btn"
        title="帮助"
      >
        ?
      </button>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import type { CanvasBgTheme } from '../canvasTheme'

defineProps<{
  canvasBgTheme: CanvasBgTheme
  showAddMenu: boolean
  showAssetsPanel: boolean
  showHistoryPanel: boolean
}>()

const emit = defineEmits<{
  'toggle-add-menu': []
  'toggle-assets-panel': []
  'toggle-history-panel': []
}>()
</script>
