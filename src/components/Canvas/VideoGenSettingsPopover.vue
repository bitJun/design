<template>
  <div class="video-gen-settings">
    <section class="video-gen-settings__section">
      <p class="video-gen-settings__title">{{ VIDEO_GEN_DURATION_LABEL }}</p>
      <div class="video-gen-settings__duration-grid">
        <button
          v-for="item in VIDEO_GEN_DURATIONS"
          :key="item"
          type="button"
          class="video-gen-settings__chip"
          :class="{ 'video-gen-settings__chip--active': duration === item }"
          @click="duration = item"
        >
          {{ item }}s
        </button>
      </div>
    </section>

    <section class="video-gen-settings__section">
      <p class="video-gen-settings__title">{{ VIDEO_GEN_ASPECT_RATIO_LABEL }}</p>
      <div class="video-gen-settings__ratio-grid">
        <button
          v-for="ratio in VIDEO_GEN_ASPECT_RATIOS"
          :key="ratio.key"
          type="button"
          class="video-gen-settings__ratio"
          :class="{ 'video-gen-settings__ratio--active': aspectRatio === ratio.key }"
          @click="aspectRatio = ratio.key"
        >
          <span
            class="video-gen-settings__ratio-preview"
            :style="{
              width: `${ratio.preview.width}px`,
              height: `${ratio.preview.height}px`,
            }"
            aria-hidden="true"
          />
          <span class="video-gen-settings__ratio-label">{{ ratio.label }}</span>
        </button>
      </div>
    </section>

    <section class="video-gen-settings__section">
      <p class="video-gen-settings__title">{{ VIDEO_GEN_RESOLUTION_LABEL }}</p>
      <div class="video-gen-settings__resolution-grid">
        <button
          v-for="item in VIDEO_GEN_RESOLUTIONS"
          :key="item"
          type="button"
          class="video-gen-settings__chip video-gen-settings__chip--wide"
          :class="{ 'video-gen-settings__chip--active': resolution === item }"
          @click="resolution = item"
        >
          {{ item }}
        </button>
      </div>
    </section>

    <div class="video-gen-settings__summary">
      {{ settingsSummary }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  VIDEO_GEN_ASPECT_RATIO_LABEL,
  VIDEO_GEN_ASPECT_RATIOS,
  VIDEO_GEN_DURATION_LABEL,
  VIDEO_GEN_DURATIONS,
  VIDEO_GEN_RESOLUTION_LABEL,
  VIDEO_GEN_RESOLUTIONS,
  formatVideoGenSettings,
  type VideoGenAspectRatio,
  type VideoGenDuration,
  type VideoGenResolution,
} from './constants'

const props = withDefaults(
  defineProps<{
    duration?: VideoGenDuration
    aspectRatio?: VideoGenAspectRatio
    resolution?: VideoGenResolution
  }>(),
  {
    duration: 5,
    aspectRatio: '16:9',
    resolution: '720P',
  },
)

const emit = defineEmits<{
  'update:duration': [value: VideoGenDuration]
  'update:aspectRatio': [value: VideoGenAspectRatio]
  'update:resolution': [value: VideoGenResolution]
}>()

const duration = computed({
  get: () => props.duration,
  set: (value: VideoGenDuration) => emit('update:duration', value),
})

const aspectRatio = computed({
  get: () => props.aspectRatio,
  set: (value: VideoGenAspectRatio) => emit('update:aspectRatio', value),
})

const resolution = computed({
  get: () => props.resolution,
  set: (value: VideoGenResolution) => emit('update:resolution', value),
})

const settingsSummary = computed(() =>
  formatVideoGenSettings(duration.value, aspectRatio.value, resolution.value),
)
</script>

<style scoped lang="scss">
.video-gen-settings {
  width: 280px;
  padding: 12px 12px 0;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.video-gen-settings__section + .video-gen-settings__section {
  margin-top: 14px;
}

.video-gen-settings__title {
  margin: 0 0 10px;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.video-gen-settings__duration-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.video-gen-settings__chip {
  padding: 8px 0;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }

  &--active {
    border-color: #111827;
    color: #111827;
  }

  &--wide {
    min-width: 0;
  }
}

.video-gen-settings__ratio-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.video-gen-settings__ratio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 54px;
  padding: 8px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  color: #374151;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }

  &--active {
    border-color: #111827;
    color: #111827;
  }
}

.video-gen-settings__ratio-preview {
  display: block;
  border: 1.5px solid currentColor;
  border-radius: 2px;
  opacity: 0.85;
}

.video-gen-settings__ratio-label {
  font-size: 11px;
  line-height: 1;
}

.video-gen-settings__resolution-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.video-gen-settings__summary {
  margin: 14px -12px 0;
  padding: 10px 12px;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
  color: #374151;
  font-size: 12px;
  line-height: 1;
  text-align: center;
}
</style>
