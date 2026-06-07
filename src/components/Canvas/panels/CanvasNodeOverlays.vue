<template>
  <div
    v-if="showPromptBar"
    class="canvas__prompt"
    :class="{ 'canvas__prompt--light': canvasBgTheme === 'light' }"
    :style="{
      left: `${promptPos.left}px`,
      top: `${promptPos.top}px`,
      width: `${promptPos.width}px`,
    }"
    @mousedown.stop
  >
    <div
      class="canvas__prompt-body"
      :class="{
        'canvas__prompt-body--img2prompt': isImg2PromptTask && promptSourcePreviewUrl,
      }"
    >
      <span
        v-if="isImg2PromptTask && promptSourcePreviewUrl"
        class="canvas__prompt-ref"
      >
        <img :src="promptSourcePreviewUrl" alt="" />
        <span class="canvas__prompt-ref-badge">1</span>
      </span>
      <textarea
        :value="promptText"
        class="canvas__prompt-input"
        :placeholder="PROMPT_PLACEHOLDER"
        rows="3"
        @input="onPromptInput"
      />
    </div>
    <div class="canvas__prompt-footer">
      <button type="button" class="canvas__prompt-model-chip">
        <span class="canvas__prompt-model-mark" aria-hidden="true" />
        {{ TEXT_PROMPT_MODEL_LABEL }}
        <span class="canvas__prompt-model-arrow">▾</span>
      </button>
      <div class="canvas__prompt-actions">
        <button type="button" class="canvas__prompt-icon" title="翻译">文A</button>
        <span class="canvas__prompt-credits">⚡ 1</span>
        <button
          type="button"
          class="canvas__prompt-send"
          :class="{ 'canvas__prompt-send--disabled': !canSubmitTextPrompt }"
          :disabled="!canSubmitTextPrompt || promptSubmitting"
          title="发送"
          @click="emit('submit-text-prompt')"
        >
          {{ promptSubmitting ? '…' : '↑' }}
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="showImageGenPromptBar"
    class="canvas__img2img-prompt"
    :style="{
      left: `${imageGenPromptPos.left}px`,
      top: `${imageGenPromptPos.top}px`,
      width: `${imageGenPromptPos.width}px`,
    }"
  >
    <ImageGenPromptPanel
      :prompt="imageGenPromptText"
      :seed="imageGenSeed"
      :source-preview-url="imageGenSourcePreviewUrl"
      @update:prompt="emit('update:imageGenPromptText', $event)"
      @update:seed="emit('update:imageGenSeed', $event)"
    />
  </div>

  <div
    v-if="showVideoGenPromptBar"
    class="canvas__video-gen-prompt"
    :style="{
      left: `${videoGenPromptPos.left}px`,
      top: `${videoGenPromptPos.top}px`,
      width: `${videoGenPromptPos.width}px`,
    }"
  >
    <VideoGenPromptPanel
      :prompt="videoGenPromptText"
      :active-tab="videoGenActiveTab"
      @update:prompt="emit('update:videoGenPromptText', $event)"
      @update:active-tab="emit('update:videoGenActiveTab', $event)"
    />
  </div>

  <div
    v-if="showImageCrop && selectedKind === 'image'"
    class="canvas__image-crop"
    :style="{
      left: `${imageCropPos.left}px`,
      top: `${imageCropPos.top}px`,
      width: `${imageCropPos.width}px`,
      height: `${imageCropPos.height}px`,
    }"
    @mousedown.stop
  >
    <ImageCropOverlay
      v-if="imageCropSource"
      :image-url="imageCropSource.previewUrl"
      :natural-width="imageCropSource.mediaWidth"
      :natural-height="imageCropSource.mediaHeight"
      @cancel="emit('close-image-crop')"
      @complete="emit('image-crop-complete', $event)"
    />
  </div>

  <div
    v-if="showImageDialogue && selectedKind === 'image'"
    class="canvas__node-dialogue"
    :style="{
      left: `${dialoguePos.left}px`,
      top: `${dialoguePos.top}px`,
      width: `${dialoguePos.width}px`,
    }"
    @mousedown.stop
  >
    <ImageDialoguePanel
      :model-value="imageDialogueText"
      @update:model-value="emit('update:imageDialogueText', $event)"
    />
  </div>

  <div
    v-if="showVideoDialogue && selectedKind === 'video'"
    class="canvas__node-dialogue"
    :style="{
      left: `${dialoguePos.left}px`,
      top: `${dialoguePos.top}px`,
      width: `${dialoguePos.width}px`,
    }"
    @mousedown.stop
  >
    <VideoDialoguePanel
      :model-value="videoDialogueText"
      @update:model-value="emit('update:videoDialogueText', $event)"
    />
  </div>

  <div
    v-if="showVideoHdPanel && selectedKind === 'video'"
    class="canvas__node-side-panel"
    :style="{
      left: `${videoHdPos.left}px`,
      top: `${videoHdPos.top}px`,
      width: `${videoHdPos.width}px`,
    }"
    @mousedown.stop
  >
    <VideoHdPanel
      :model-value="videoHdMagnification"
      @update:model-value="emit('update:videoHdMagnification', $event)"
      @close="emit('reset-video-hd-panel')"
      @cancel="emit('reset-video-hd-panel')"
      @start="emit('video-hd-start')"
    />
  </div>

  <div
    v-if="showVideoFramesPanel && selectedKind === 'video'"
    class="canvas__node-dialogue"
    :style="{
      left: `${dialoguePos.left}px`,
      top: `${dialoguePos.top}px`,
      width: `${dialoguePos.width}px`,
    }"
    @mousedown.stop
  >
    <VideoFramesPanel />
  </div>
</template>

<script setup lang="ts">
import ImageGenPromptPanel from '../ImageGenPromptPanel.vue'
import VideoGenPromptPanel from '../VideoGenPromptPanel.vue'
import ImageDialoguePanel from '../ImageDialoguePanel.vue'
import ImageCropOverlay from '../ImageCropOverlay.vue'
import VideoDialoguePanel from '../VideoDialoguePanel.vue'
import VideoHdPanel from '../VideoHdPanel.vue'
import VideoFramesPanel from '../VideoFramesPanel.vue'
import {
  PROMPT_PLACEHOLDER,
  TEXT_PROMPT_MODEL_LABEL,
  type NodeKind,
  type VideoHdMagnification,
} from '../constants'
import type { CanvasBgTheme } from '../canvasTheme'

defineProps<{
  canvasBgTheme: CanvasBgTheme
  showPromptBar: boolean
  showImageGenPromptBar: boolean
  showVideoGenPromptBar: boolean
  promptPos: { left: number; top: number; width: number }
  imageGenPromptPos: { left: number; top: number; width: number }
  videoGenPromptPos: { left: number; top: number; width: number }
  imageCropPos: { left: number; top: number; width: number; height: number }
  dialoguePos: { left: number; top: number; width: number }
  videoHdPos: { left: number; top: number; width: number }
  selectedKind: NodeKind | null
  showImageCrop: boolean
  showImageDialogue: boolean
  showVideoDialogue: boolean
  showVideoHdPanel: boolean
  showVideoFramesPanel: boolean
  imageCropSource: {
    previewUrl: string
    mediaWidth: number
    mediaHeight: number
  } | null
  promptText: string
  promptSourcePreviewUrl: string
  promptSubmitting: boolean
  canSubmitTextPrompt: boolean
  isImg2PromptTask: boolean
  imageGenPromptText: string
  imageGenSeed: number
  imageGenSourcePreviewUrl: string
  videoGenPromptText: string
  videoGenActiveTab: string
  imageDialogueText: string
  videoDialogueText: string
  videoHdMagnification: VideoHdMagnification
}>()

const emit = defineEmits<{
  'update:promptText': [value: string]
  'update:imageGenPromptText': [value: string]
  'update:imageGenSeed': [value: number]
  'update:videoGenPromptText': [value: string]
  'update:videoGenActiveTab': [value: string]
  'update:imageDialogueText': [value: string]
  'update:videoDialogueText': [value: string]
  'update:videoHdMagnification': [value: VideoHdMagnification]
  'persist-prompt-bar-draft': []
  'submit-text-prompt': []
  'close-image-crop': []
  'image-crop-complete': [payload: { dataUrl: string; width: number; height: number }]
  'reset-video-hd-panel': []
  'video-hd-start': []
}>()

function onPromptInput(event: Event) {
  emit('update:promptText', (event.target as HTMLTextAreaElement).value)
  emit('persist-prompt-bar-draft')
}
</script>
