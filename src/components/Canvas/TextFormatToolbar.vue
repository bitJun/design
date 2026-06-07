<template>
  <div
    class="text-format-toolbar"
    :class="{ 'text-format-toolbar--light': isLightTheme }"
    @mousedown.stop
  >
    <template v-for="item in TEXT_FORMAT_TOOLBAR" :key="item.key">
      <button
        type="button"
        class="text-format-toolbar__btn"
        :title="item.title"
        @click="emit('command', item.key)"
      >
        {{ item.label }}
      </button>
      <span
        v-if="item.dividerAfter"
        class="text-format-toolbar__divider"
        aria-hidden="true"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { TEXT_FORMAT_TOOLBAR, type TextFormatCommand } from './constants'
import { useCanvasBgTheme } from './useCanvasBgTheme'

const { isLightTheme } = useCanvasBgTheme()

const emit = defineEmits<{
  command: [cmd: TextFormatCommand]
}>()
</script>

<style scoped lang="scss">
.text-format-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 10px;
  border: 1px solid #3d3d45;
  border-radius: 999px;
  background: rgba(30, 30, 34, 0.98);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.text-format-toolbar--light {
  border-color: #e5e7eb;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);

  .text-format-toolbar__btn {
    color: #374151;

    &:hover {
      background: #f3f4f6;
    }
  }

  .text-format-toolbar__divider {
    background: #e5e7eb;
  }
}

.text-format-toolbar__btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #d1d5db;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #3d3d45;
  }
}

.text-format-toolbar__divider {
  width: 1px;
  height: 16px;
  margin: 0 2px;
  background: #3d3d45;
}
</style>
