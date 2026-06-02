<template>
  <div class="image-dialogue">
    <div class="image-dialogue__head">
      <div class="image-dialogue__greeting">
        <span class="image-dialogue__avatar" aria-hidden="true" />
        <span class="image-dialogue__greeting-text">{{ IMAGE_DIALOGUE_GREETING }}</span>
      </div>
      <div class="image-dialogue__head-actions">
        <div class="image-dialogue__color-wrap">
          <button
            type="button"
            class="image-dialogue__select"
            :class="{ 'image-dialogue__select--active': showColorPicker }"
            @click="toggleColorPicker"
          >
            色彩
            <span class="image-dialogue__select-arrow" aria-hidden="true" />
          </button>
        </div>
        <div class="image-dialogue__advisor-wrap">
          <button
            type="button"
            class="image-dialogue__select"
            :class="{ 'image-dialogue__select--active': showAdvisorMenu }"
            @click="toggleAdvisorMenu"
          >
            设计参谋
            <span class="image-dialogue__select-arrow" aria-hidden="true" />
          </button>
        </div>
        <button type="button" class="image-dialogue__history" title="历史">
          <span class="image-dialogue__history-icon" aria-hidden="true" />
        </button>
      </div>
    </div>

    <textarea
      :value="modelValue"
      class="image-dialogue__input"
      :placeholder="IMAGE_DIALOGUE_PLACEHOLDER"
      rows="3"
      @input="onInput"
    />

    <div class="image-dialogue__footer">
      <div class="image-dialogue__tools">
        <button type="button" class="image-dialogue__tool" title="图片">
          <span class="image-dialogue__tool-icon" data-icon="image" aria-hidden="true" />
        </button>
        <button type="button" class="image-dialogue__tool" title="选择">
          <span class="image-dialogue__tool-icon" data-icon="cursor" aria-hidden="true" />
        </button>
        <button type="button" class="image-dialogue__tool" title="定位">
          <span class="image-dialogue__tool-icon" data-icon="pin" aria-hidden="true" />
        </button>
        <button type="button" class="image-dialogue__tool" title="编辑">
          <span class="image-dialogue__tool-icon" data-icon="edit" aria-hidden="true" />
        </button>
      </div>
      <div class="image-dialogue__actions">
        <button type="button" class="image-dialogue__cube" title="模型">
          <span class="image-dialogue__cube-icon" aria-hidden="true" />
        </button>
        <button type="button" class="image-dialogue__auto">
          auto
          <span class="image-dialogue__select-arrow" aria-hidden="true" />
        </button>
        <div class="image-dialogue__gen-settings-wrap">
          <button
            type="button"
            class="image-dialogue__auto"
            :class="{ 'image-dialogue__auto--active': showGenSettings }"
            @click="toggleGenSettings"
          >
            {{ genAspectRatio }}
            <span class="image-dialogue__select-arrow" aria-hidden="true" />
          </button>
          <div
            v-if="showGenSettings"
            class="image-dialogue__gen-settings-menu"
            @mousedown.stop
          >
            <ImageGenSettingsPopover
              v-model:aspect-ratio="genAspectRatio"
              v-model:image-count="genImageCount"
            />
          </div>
        </div>
        <button type="button" class="image-dialogue__send" title="发送">
          <span class="image-dialogue__send-icon" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div
      v-if="showColorPicker"
      class="image-dialogue__color-panel-wrap"
      @mousedown.stop
    >
      <ImageColorPickerPanel
        v-model="selectedColor"
        @close="resetColorPicker"
        @select="onColorSelect"
      />
    </div>

    <div
      v-if="showAdvisorMenu"
      class="image-dialogue__advisor-menu"
      @mousedown.stop
    >
      <div class="image-dialogue__advisor-title">
        <span>{{ IMAGE_DESIGN_ADVISOR_TITLE }}</span>
        <span class="image-dialogue__advisor-title-arrow" aria-hidden="true" />
      </div>
      <button
        v-for="item in IMAGE_DESIGN_ADVISOR_MENU"
        :key="item.key"
        type="button"
        class="image-dialogue__advisor-item"
        @click="selectAdvisorItem"
      >
        <span>{{ item.label }}</span>
        <span class="image-dialogue__advisor-arrow" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageColorPickerPanel from './ImageColorPickerPanel.vue'
import ImageGenSettingsPopover from './ImageGenSettingsPopover.vue'
import {
  IMAGE_COLOR_DEFAULT,
  IMAGE_DESIGN_ADVISOR_MENU,
  IMAGE_DESIGN_ADVISOR_TITLE,
  IMAGE_DIALOGUE_GREETING,
  IMAGE_DIALOGUE_PLACEHOLDER,
  type ImageGenAspectRatio,
  type ImageGenCount,
} from './constants'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showAdvisorMenu = ref(false)
const showColorPicker = ref(false)
const showGenSettings = ref(false)
const selectedColor = ref(IMAGE_COLOR_DEFAULT)
const genAspectRatio = ref<ImageGenAspectRatio>('auto')
const genImageCount = ref<ImageGenCount>(1)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

function toggleGenSettings() {
  showGenSettings.value = !showGenSettings.value
}

function toggleColorPicker() {
  showColorPicker.value = !showColorPicker.value
  if (showColorPicker.value) {
    showAdvisorMenu.value = false
    showGenSettings.value = false
  }
}

function resetColorPicker() {
  showColorPicker.value = false
}

function onColorSelect() {
  resetColorPicker()
}

function toggleAdvisorMenu() {
  showAdvisorMenu.value = !showAdvisorMenu.value
  if (showAdvisorMenu.value) {
    showColorPicker.value = false
    showGenSettings.value = false
  }
}

function selectAdvisorItem() {
  showAdvisorMenu.value = false
}
</script>

<style scoped lang="scss">
.image-dialogue {
  position: relative;
  width: 100%;
  padding: 14px 16px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
  overflow: visible;
}

.image-dialogue__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.image-dialogue__greeting {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.image-dialogue__avatar {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f3f4f6 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='11' fill='%23eef2ff'/%3E%3Ccircle cx='12' cy='10' r='4' fill='%23c7d2fe'/%3E%3Cpath fill='%23c7d2fe' d='M6 18c1.2-2.4 3.4-3.8 6-3.8s4.8 1.4 6 3.8'/%3E%3C/svg%3E") center / 24px 24px no-repeat;
}

.image-dialogue__greeting-text {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-dialogue__head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.image-dialogue__color-wrap,
.image-dialogue__advisor-wrap,
.image-dialogue__gen-settings-wrap {
  position: relative;
}

.image-dialogue__gen-settings-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 5;
}

.image-dialogue__auto--active {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.image-dialogue__color-panel-wrap {
  position: absolute;
  right: 0;
  bottom: 72px;
  z-index: 4;
  transform: translateX(calc(100% + 10px));
}

.image-dialogue__select,
.image-dialogue__auto {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
}

.image-dialogue__select--active {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.image-dialogue__select-arrow {
  width: 10px;
  height: 10px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' viewBox='0 0 10 10'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M2.5 3.75 5 6.25 7.5 3.75'/%3E%3C/svg%3E") center / 10px 10px no-repeat;
}

.image-dialogue__advisor-menu {
  position: absolute;
  right: 0;
  bottom: 72px;
  z-index: 3;
  min-width: 168px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  transform: translateX(calc(100% + 10px));
}

.image-dialogue__advisor-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  padding: 6px 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
}

.image-dialogue__advisor-title-arrow {
  width: 10px;
  height: 10px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' viewBox='0 0 10 10'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M2.5 6.25 5 3.75 7.5 6.25'/%3E%3C/svg%3E") center / 10px 10px no-repeat;
}

.image-dialogue__advisor-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #374151;
  font-size: 13px;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
}

.image-dialogue__advisor-arrow {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' viewBox='0 0 10 10'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M3.75 2.5 6.25 5 3.75 7.5'/%3E%3C/svg%3E") center / 10px 10px no-repeat;
}

.image-dialogue__history {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
}

.image-dialogue__history-icon {
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M8 3.5v4.5l2.5 1.5'/%3E%3Ccircle cx='8' cy='8' r='5' stroke='%236b7280' stroke-width='1.2'/%3E%3C/svg%3E") center / 16px 16px no-repeat;
}

.image-dialogue__input {
  width: 100%;
  min-height: 88px;
  padding: 12px 14px;
  border: 1px solid #eef0f3;
  border-radius: 12px;
  background: #fafafa;
  color: #111827;
  font-size: 14px;
  line-height: 1.55;
  resize: none;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #d1d5db;
    background: #fff;
  }
}

.image-dialogue__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.image-dialogue__tools,
.image-dialogue__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.image-dialogue__tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
}

.image-dialogue__tool-icon {
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px 16px;

  &[data-icon='image'] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'%3E%3Crect x='2.5' y='3.5' width='11' height='9' rx='1' stroke='%236b7280' stroke-width='1.2'/%3E%3Ccircle cx='6' cy='7' r='1.2' fill='%236b7280'/%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-width='1.2' d='m4 11 2.5-2.5 2 2 2.5-3 2 3.5'/%3E%3C/svg%3E");
  }

  &[data-icon='cursor'] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'%3E%3Cpath fill='%236b7280' d='M4 2.5 12.5 8 8.5 8.8 10.5 13.5 8.8 14.2 6.8 9.5 4 11.5z'/%3E%3C/svg%3E");
  }

  &[data-icon='pin'] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M8 2.5v8M5.5 10.5h5'/%3E%3Ccircle cx='8' cy='12.5' r='1' fill='%236b7280'/%3E%3C/svg%3E");
  }

  &[data-icon='edit'] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M3 10.5V13h2.5L12.5 6 10 3.5z'/%3E%3C/svg%3E");
  }
}

.image-dialogue__cube {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
}

.image-dialogue__cube-icon {
  width: 14px;
  height: 14px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 14 14'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M2.5 4.5 7 2.5l4.5 2v5L7 11.5l-4.5-2zM7 2.5v9'/%3E%3C/svg%3E") center / 14px 14px no-repeat;
}

.image-dialogue__send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #111827;
  cursor: pointer;

  &:hover {
    background: #1f2937;
  }
}

.image-dialogue__send-icon {
  width: 14px;
  height: 14px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 14 14'%3E%3Cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.4' d='M7 10V4M4.5 6.5 7 4l2.5 2.5'/%3E%3C/svg%3E") center / 14px 14px no-repeat;
}
</style>
