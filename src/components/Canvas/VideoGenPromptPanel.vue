<template>
  <div
    class="video-gen-prompt-panel"
    :class="{ 'video-gen-prompt-panel--light': isLightTheme }"
    @mousedown="onPanelMouseDown"
  >
    <p v-if="showConnectHint" class="video-gen-prompt-panel__hint">
      需要连接图片节点（1~9个）
    </p>

    <div class="video-gen-prompt-panel__tabs">
      <button
        v-for="tab in VIDEO_GEN_TABS"
        :key="tab.key"
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

    <div class="video-gen-prompt-panel__head">
      <div class="video-gen-prompt-panel__actions">
        <button
          v-for="action in VIDEO_GEN_QUICK_ACTIONS"
          :key="action.key"
          type="button"
          class="video-gen-prompt-panel__action"
        >
          <span class="video-gen-prompt-panel__action-icon" :data-icon="action.icon" />
          {{ action.label }}
        </button>
      </div>
      <button type="button" class="video-gen-prompt-panel__expand" title="展开">⤢</button>
    </div>

    <textarea
      :value="prompt"
      class="video-gen-prompt-panel__input"
      :placeholder="VIDEO_GEN_PROMPT_PLACEHOLDER"
      rows="2"
      @input="onPromptInput"
    />

    <div class="video-gen-prompt-panel__footer">
      <a-dropdown>
        <button type="button" class="video-gen-prompt-panel__chip" @click.prevent>
          Cascading menu
          <DownOutlined />
        </button>
        <template #overlay>
          <a-menu>
            <a-menu-item>1st menu item</a-menu-item>
            <a-menu-item>2nd menu item</a-menu-item>
            <a-sub-menu key="sub1" title="sub menu">
              <a-menu-item>3rd menu item</a-menu-item>
              <a-menu-item>4th menu item</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="sub2" title="disabled sub menu" disabled>
              <a-menu-item>5d menu item</a-menu-item>
              <a-menu-item>6th menu item</a-menu-item>
            </a-sub-menu>
          </a-menu>
        </template>
      </a-dropdown>
      <button type="button" class="video-gen-prompt-panel__chip">16:9 · 720P · 5s 🔊 ▾</button>
      <span class="video-gen-prompt-panel__tools">
        <button type="button" class="video-gen-prompt-panel__tool" title="翻译">文</button>
        <button type="button" class="video-gen-prompt-panel__tool" title="设置">☰</button>
      </span>
      <button type="button" class="video-gen-prompt-panel__chip">1个 ▾</button>
      <span class="video-gen-prompt-panel__credits">⚡ 135</span>
      <button type="button" class="video-gen-prompt-panel__send" title="生成">↑</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasBgTheme } from './useCanvasBgTheme'
import {
  VIDEO_GEN_PROMPT_PLACEHOLDER,
  VIDEO_GEN_QUICK_ACTIONS,
  VIDEO_GEN_TABS,
} from './constants'

const { isLightTheme } = useCanvasBgTheme()

const props = defineProps<{
  prompt: string
  activeTab: string
}>()

const emit = defineEmits<{
  'update:prompt': [value: string]
  'update:activeTab': [value: string]
  'drag-start': [event: MouseEvent]
}>()

const DRAG_IGNORE_SELECTOR =
  'button, textarea, input, select, a, [contenteditable], .ant-dropdown, .ant-dropdown-menu'

function onPanelMouseDown(event: MouseEvent) {
  event.stopPropagation()
  const target = event.target as HTMLElement | null
  if (target?.closest(DRAG_IGNORE_SELECTOR)) return
  emit('drag-start', event)
}

const showConnectHint = computed(
  () => props.activeTab === 'frames' || props.activeTab === 'first',
)

function selectTab(key: string) {
  const tab = VIDEO_GEN_TABS.find((item) => item.key === key)
  if (tab?.disabled) return
  emit('update:activeTab', key)
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

  .video-gen-prompt-panel--light & {
    background: #f3f4f6;
    color: #6b7280;
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
  background: #6b7cff;
  color: #fff;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background: #5b6cff;
  }
}
</style>
