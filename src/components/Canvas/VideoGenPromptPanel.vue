<template>
  <div
    class="video-gen-prompt-panel"
    :class="{ 'video-gen-prompt-panel--light': isLightTheme }"
    @mousedown="onPanelMouseDown"
  >
    <!-- <p
      v-if="validationHint"
      class="video-gen-prompt-panel__hint"
      :class="{ 'video-gen-prompt-panel__hint--error': validationError }"
    >
      {{ validationHint }}
    </p> -->

    <div class="video-gen-prompt-panel__tabs">
      <div 
        v-for="tab in videoGenTabs"
        :key="tab.key"
      >
        <a-tooltip v-if="tab.disabled">
          <template #title>{{ tab.disabledHint }}</template>
          <button
            type="button"
            class="video-gen-prompt-panel__tab"
            :class="{
              'video-gen-prompt-panel__tab--active': activeTab === tab.key,
              'video-gen-prompt-panel__tab--active-disabled': activeTab === tab.key && tab.disabled,
            }"
            :disabled="tab.disabled"
            @click="selectTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </a-tooltip>
        <button
          v-else
          type="button"
          class="video-gen-prompt-panel__tab"
          :class="{
            'video-gen-prompt-panel__tab--active': activeTab === tab.key,
            'video-gen-prompt-panel__tab--active-disabled': activeTab === tab.key && tab.disabled,
          }"
          :disabled="tab.disabled"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- <div class="video-gen-prompt-panel__head">
      <div class="video-gen-prompt-panel__actions">
        <button
          v-for="action in VIDEO_GEN_QUICK_ACTIONS"
          :key="action.key"
          type="button"
          class="video-gen-prompt-panel__action"
          :class="{ 'video-gen-prompt-panel__action--active': action.key === 'mark' && elementSelectMode }"
          @click="emit('quick-action', action.key)"
        >
          <span class="video-gen-prompt-panel__action-icon" :data-icon="action.icon" />
          {{ action.label }}
        </button>
      </div>
      <button type="button" class="video-gen-prompt-panel__expand" title="展开">⤢</button>
    </div> -->

    <div
      v-if="showSourceRefs"
      class="video-gen-prompt-panel__refs"
    >
      <div
        v-for="ref in displayRefs"
        :key="ref.nodeId"
        class="video-gen-prompt-panel__ref"
        :class="{ 'video-gen-prompt-panel__ref--invalid': validationError }"
      >
        <img :src="ref.previewUrl" alt="" />
        <span v-if="ref.badge" class="video-gen-prompt-panel__ref-badge">{{ ref.badge }}</span>
        <span v-else class="video-gen-prompt-panel__ref-index">{{ ref.index }}</span>
      </div>
    </div>

    <textarea
      :value="prompt"
      class="video-gen-prompt-panel__input"
      :placeholder="VIDEO_GEN_PROMPT_PLACEHOLDER"
      rows="2"
      @input="onPromptInput"
    />

    <div class="video-gen-prompt-panel__footer">
      <button type="button" class="video-gen-prompt-panel__chip video-gen-prompt-panel__chip--vip">
        Seedance 2.0 VIP
      </button>
      <button type="button" class="video-gen-prompt-panel__chip">16:9 · 720P · 5s 🔊 ▾</button>
      <span class="video-gen-prompt-panel__tools">
        <button type="button" class="video-gen-prompt-panel__tool" title="翻译">文</button>
        <button type="button" class="video-gen-prompt-panel__tool" title="设置">☰</button>
      </span>
      <button type="button" class="video-gen-prompt-panel__chip">1个 ▾</button>
      <span class="video-gen-prompt-panel__credits">⚡ 122/135</span>
      <button
        type="button"
        class="video-gen-prompt-panel__send"
        :class="{ 'video-gen-prompt-panel__send--disabled': Boolean(validationError) }"
        :disabled="Boolean(validationError)"
        title="生成"
      >
        ↑
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvasBgTheme } from './useCanvasBgTheme'
import {
  VIDEO_GEN_PROMPT_PLACEHOLDER,
  VIDEO_GEN_QUICK_ACTIONS,
  VIDEO_GEN_TABS,
} from './constants'
import { getVideoGenTabValidation } from './videoGen'
import type { VideoSourceRef } from './videoGen'

const { isLightTheme } = useCanvasBgTheme()
const videoGenTabs = ref<Array<{ key: string; label: string; disabled?: boolean; disabledHint?: string }>>([
  { key: 'text2video', label: '文生视频', disabled: true, disabledHint: '已接入媒体输入,无法使用纯文生视频' },
  { key: 'reference', label: '全能参考', disabled: false, disabledHint: '' },
  { key: 'img2video', label: '图生视频', disabled: false, disabledHint: '' },
  { key: 'frames', label: '首尾帧', disabled: false, disabledHint: '' },
  { key: 'imageRef', label: '图片参考', disabled: false, disabledHint: '' },
])

const props = defineProps<{
  prompt: string
  activeTab: string
  sourceRefs?: VideoSourceRef[]
  elementSelectMode?: boolean
}>()

const emit = defineEmits<{
  'update:prompt': [value: string]
  'update:activeTab': [value: string]
  'drag-start': [event: MouseEvent]
  'quick-action': [key: string]
}>()

const DRAG_IGNORE_SELECTOR =
  'button, textarea, input, select, a, [contenteditable], .ant-dropdown, .ant-dropdown-menu'

function onPanelMouseDown(event: MouseEvent) {
  event.stopPropagation()
  const target = event.target as HTMLElement | null
  if (target?.closest(DRAG_IGNORE_SELECTOR)) return
  emit('drag-start', event)
}

const sourceCount = computed(() => props.sourceRefs?.length ?? 0)

const validationHint = computed(() => {
  videoGenTabs.value = videoGenTabs.value.map((item:any) => {
    if (item.key === 'img2video') {
      item.disabledHint = `当前图片数量 ${sourceCount.value} 个，需要1个`
      if (sourceCount.value > 1) {
        if (props.activeTab === 'img2video') {
          emit('update:activeTab', 'reference');
        }
        item.disabled = true;
      } else {
        item.disabled = false;
      }
    }
    if (item.key === 'frames') {
      item.disabledHint = `当前图片数量 ${sourceCount.value} 个，需要1~2个`
      if (sourceCount.value > 2) {
        if (props.activeTab === 'frames') {
          emit('update:activeTab', 'reference');
        }
        item.disabled = true;
      } else {
        item.disabled = false;
      }
    }
    return item
  });
  return getVideoGenTabValidation(props.activeTab, sourceCount.value)
})

const validationError = computed(() => {
  const hint = validationHint.value
  if (!hint) return false
  return sourceCount.value > 0
})

const showSourceRefs = computed(() => {
  if (props.activeTab === 'text2video') return false
  return (props.sourceRefs?.length ?? 0) > 0
})

const displayRefs = computed(() => {
  const refs = props.sourceRefs ?? []
  if (props.activeTab === 'frames') {
    return refs.slice(0, 2).map((ref, index) => ({
      ...ref,
      badge: index === 0 ? '首帧' : '尾帧',
    }))
  }
  if (props.activeTab === 'imageRef' && refs.length === 1) {
    return refs.map((ref) => ({ ...ref, badge: '首帧' }))
  }
  return refs.map((ref) => ({ ...ref, badge: '' }))
})

function selectTab(key: string) {
  const tab = VIDEO_GEN_TABS.find((item) => item.key === key);
  if (tab?.disabled) return
  emit('update:activeTab', key);
}

function onPromptInput(event: Event) {
  emit('update:prompt', (event.target as HTMLTextAreaElement).value)
}
</script>

<style scoped lang="scss">
.video-gen-prompt-panel {
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #3d3d45;
  border-radius: 14px;
  background: rgba(24, 24, 28, 0.98);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  cursor: move;

  &--light {
    border-color: #e5e7eb;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
  }
}

.video-gen-prompt-panel__hint {
  margin: 0 0 10px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #252528;
  color: #9ca3af;
  font-size: 12px;
  text-align: center;

  &--error {
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
  }

  .video-gen-prompt-panel--light & {
    background: #f3f4f6;
    color: #6b7280;

    &--error {
      background: rgba(239, 68, 68, 0.08);
      color: #dc2626;
    }
  }
}

.video-gen-prompt-panel__tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #2e2e34;
  overflow-x: auto;

  .video-gen-prompt-panel--light & {
    border-bottom-color: #e5e7eb;
  }
}

.video-gen-prompt-panel__tab {
  flex-shrink: 0;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: #e5e7eb;
    background: #2a2a30;
  }

  &--active,
  &--active-disabled {
    color: #f3f4f6;
    background: #3d3d45;
  }

  .video-gen-prompt-panel--light & {
    color: #9ca3af;

    &:hover:not(:disabled) {
      color: #374151;
      background: #f3f4f6;
    }

    &--active,
    &--active-disabled {
      color: #111827;
      background: #e5e7eb;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.video-gen-prompt-panel__head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.video-gen-prompt-panel__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.video-gen-prompt-panel__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 52px;
  padding: 6px 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;

  &:hover,
  &--active {
    background: #2a2a30;
    color: #e5e7eb;
  }

  .video-gen-prompt-panel--light & {
    color: #6b7280;

    &:hover,
    &--active {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

.video-gen-prompt-panel__action-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #3d3d45;

  .video-gen-prompt-panel--light & {
    background: #e5e7eb;
  }

  &[data-icon='mark']::after {
    content: '⌖';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 14px;
    color: #9ca3af;
  }

  &[data-icon='camera']::after {
    content: '▣';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;
    color: #9ca3af;
  }

  &[data-icon='role']::after {
    content: '♟';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 14px;
    color: #9ca3af;
  }
}

.video-gen-prompt-panel__expand {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #2a2a30;
    color: #e5e7eb;
  }

  .video-gen-prompt-panel--light & {
    color: #6b7280;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

.video-gen-prompt-panel__refs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.video-gen-prompt-panel__ref {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  background: #2a2a30;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &--invalid {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .video-gen-prompt-panel--light & {
    background: #f3f4f6;
  }
}

.video-gen-prompt-panel__ref-badge,
.video-gen-prompt-panel__ref-index {
  position: absolute;
  left: 4px;
  bottom: 4px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 10px;
  line-height: 1.3;
}

.video-gen-prompt-panel__ref-index {
  left: auto;
  right: 4px;
  min-width: 16px;
  text-align: center;
  border-radius: 50%;
  padding: 1px 0;
}

.video-gen-prompt-panel__input {
  width: 100%;
  min-height: 52px;
  margin-bottom: 10px;
  padding: 0;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  outline: none;
  box-sizing: border-box;
  cursor: text;

  &::placeholder {
    color: #6b7280;
  }

  .video-gen-prompt-panel--light & {
    color: #111827;

    &::placeholder {
      color: #9ca3af;
    }
  }
}

.video-gen-prompt-panel__footer {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.video-gen-prompt-panel__chip {
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  background: #252528;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #2a2a30;
    color: #e5e7eb;
  }

  &--vip {
    color: #c4b5fd;
  }

  .video-gen-prompt-panel--light & {
    background: #f3f4f6;
    color: #6b7280;

    &:hover {
      background: #e5e7eb;
      color: #374151;
    }

    &--vip {
      color: #7c3aed;
    }
  }
}

.video-gen-prompt-panel__tools {
  display: flex;
  gap: 4px;
}

.video-gen-prompt-panel__tool {
  padding: 4px 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #252528;
    color: #e5e7eb;
  }

  .video-gen-prompt-panel--light & {
    color: #6b7280;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

.video-gen-prompt-panel__credits {
  margin-left: auto;
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;

  .video-gen-prompt-panel--light & {
    color: #9ca3af;
  }
}

.video-gen-prompt-panel__send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #111827;
  color: #fff;
  font-size: 18px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #1f2937;
  }

  &--disabled,
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .video-gen-prompt-panel--light & {
    background: #111827;
  }
}
</style>
