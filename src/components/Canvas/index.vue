<template>
  <div ref="canvasRef" class="canvas" :class="`canvas--bg-${canvasBgTheme}`">
    <header class="canvas__header">
      <div class="canvas__brand">
        <button type="button" class="canvas__brand-magic" title="AI 创作">
          <span class="canvas__brand-magic-icon" aria-hidden="true" />
        </button>
        <div class="canvas__brand-project-wrap">
          <button
            type="button"
            class="canvas__brand-project"
            :class="{ 'canvas__brand-project--active': showProjectMenu }"
            @click="toggleProjectMenu"
          >
            <span class="canvas__brand-project-name">{{ currentProjectName }}</span>
            <span class="canvas__brand-project-arrow" aria-hidden="true" />
          </button>
          <div
            v-if="showProjectMenu"
            class="canvas__project-menu"
            @mousedown.stop
          >
            <div class="canvas__project-menu-head">
              <span class="canvas__project-menu-title">我的创作</span>
              <div class="canvas__project-menu-legend">
                <span class="canvas__project-menu-legend-item">
                  <i class="canvas__project-status canvas__project-status--saved" aria-hidden="true" />
                  已存
                </span>
                <span class="canvas__project-menu-legend-item">
                  <i class="canvas__project-status canvas__project-status--unsaved" aria-hidden="true" />
                  未存
                </span>
              </div>
            </div>
            <button
              v-for="project in canvasProjects"
              :key="project.id"
              type="button"
              class="canvas__project-item"
              :class="{ 'canvas__project-item--active': project.id === activeProjectId }"
              @click="selectProject(project.id)"
            >
              <span
                class="canvas__project-doc"
                :class="{ 'canvas__project-doc--active': project.id === activeProjectId }"
                aria-hidden="true"
              />
              <i
                class="canvas__project-status"
                :class="project.saved ? 'canvas__project-status--saved' : 'canvas__project-status--unsaved'"
                aria-hidden="true"
              />
              <span class="canvas__project-name">{{ project.name }}</span>
              <span
                v-if="project.id === activeProjectId"
                class="canvas__project-check"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        <button type="button" class="canvas__brand-add" title="新建">+</button>
        <span class="canvas__brand-divider" aria-hidden="true" />
        <div class="canvas__brand-group">
          <button type="button" class="canvas__brand-icon-btn" title="撤销">
            <span class="canvas__brand-icon canvas__brand-icon--undo" aria-hidden="true" />
          </button>
          <button type="button" class="canvas__brand-icon-btn" title="重做" disabled>
            <span class="canvas__brand-icon canvas__brand-icon--redo" aria-hidden="true" />
          </button>
        </div>
        <span class="canvas__brand-divider" aria-hidden="true" />
        <div class="canvas__brand-group">
          <button type="button" class="canvas__brand-icon-btn" title="保存" @click="handleSaveCanvas">
            <span class="canvas__brand-icon canvas__brand-icon--save" aria-hidden="true" />
          </button>
          <button type="button" class="canvas__brand-icon-btn" title="打开文件夹">
            <span class="canvas__brand-icon canvas__brand-icon--folder" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div class="canvas__header-actions">
        <button type="button" class="canvas__header-pill" @click="handleExportCanvas">
          <span class="canvas__header-pill-icon canvas__header-pill-icon--share" aria-hidden="true" />
          导出
        </button>
        <div class="canvas__header-pill canvas__header-pill--credits">
          <span class="canvas__header-pill-icon canvas__header-pill-icon--star" aria-hidden="true" />
          <span class="canvas__header-credits-value">{{ canvasCredits }}</span>
          <span class="canvas__header-avatar" aria-hidden="true" />
        </div>
      </div>
    </header>

    <div ref="graphRef" class="canvas__graph" />
    <div
      v-if="showNodeToolbar && !showImageCrop"
      class="canvas__node-toolbar"
      :class="{ 'canvas__node-toolbar--image': isLightNodeToolbar }"
      :style="{ left: `${toolbarPos.left}px`, top: `${toolbarPos.top}px` }"
      @mousedown.stop
    >
      <template v-if="showToolbarFeatureButtons">
        <template v-if="selectedKind === 'image'">
          <template v-if="showImageToolbarMore">
            <button
              type="button"
              class="canvas__node-toolbar-btn canvas__node-toolbar-btn--icon"
              title="返回"
              @click="closeImageToolbarMore"
            >
              <span class="canvas__node-toolbar-icon" data-icon="back" aria-hidden="true" />
            </button>
            <span class="canvas__node-toolbar-divider" aria-hidden="true" />
            <div class="canvas__node-toolbar-group">
              <template v-for="item in IMAGE_NODE_TOOLBAR_MORE.actions" :key="item.key">
                <div v-if="item.key === 'more'" class="canvas__node-toolbar-more">
                  <button
                    type="button"
                    class="canvas__node-toolbar-btn"
                    :class="{ 'canvas__node-toolbar-btn--active': showImageToolbarMoreMenu }"
                    @click="toggleImageToolbarMoreMenu"
                  >
                    <span
                      v-if="item.icon"
                      class="canvas__node-toolbar-icon"
                      :data-icon="item.icon"
                      aria-hidden="true"
                    />
                    {{ item.label }}
                  </button>
                  <div
                    v-if="showImageToolbarMoreMenu"
                    class="canvas__node-toolbar-menu"
                    @mousedown.stop
                  >
                    <button
                      v-for="menuItem in IMAGE_NODE_TOOLBAR_MORE_MENU"
                      :key="menuItem.key"
                      type="button"
                      class="canvas__node-toolbar-menu-item"
                    >
                      <span
                        class="canvas__node-toolbar-icon"
                        :data-icon="menuItem.icon"
                        aria-hidden="true"
                      />
                      <span class="canvas__node-toolbar-menu-label">{{ menuItem.label }}</span>
                      <span
                        v-if="menuItem.hasSubmenu"
                        class="canvas__node-toolbar-menu-arrow"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
                <div v-else class="canvas__node-toolbar-hover">
                  <button type="button" class="canvas__node-toolbar-btn">
                    <span
                      v-if="item.icon"
                      class="canvas__node-toolbar-icon"
                      :data-icon="item.icon"
                      aria-hidden="true"
                    />
                    {{ item.label }}
                  </button>
                  <span
                    v-if="getImageToolbarMoreHover(item.key)?.tooltip"
                    class="canvas__node-toolbar-tooltip-label"
                  >
                    {{ getImageToolbarMoreHover(item.key)?.tooltip }}
                  </span>
                  <div
                    v-if="getImageToolbarMoreHover(item.key)?.menu?.length"
                    class="canvas__node-toolbar-dropdown-menu"
                    @mousedown.stop
                  >
                    <button
                      v-for="menuLabel in getImageToolbarMoreHover(item.key)?.menu"
                      :key="menuLabel"
                      type="button"
                      class="canvas__node-toolbar-dropdown-item"
                    >
                      {{ menuLabel }}
                    </button>
                  </div>
                </div>
              </template>
            </div>
            <span class="canvas__node-toolbar-divider" aria-hidden="true" />
            <button type="button" class="canvas__node-toolbar-btn canvas__node-toolbar-btn--icon" title="下载">
              <span class="canvas__node-toolbar-icon" data-icon="download" aria-hidden="true" />
            </button>
          </template>
          <template v-else>
            <div class="canvas__node-toolbar-group">
              <button
                type="button"
                class="canvas__node-toolbar-btn"
                :class="{ 'canvas__node-toolbar-btn--active': showImageDialogue }"
                @click="toggleImageDialogue"
              >
                <span class="canvas__node-toolbar-icon" data-icon="chat" aria-hidden="true" />
                {{ IMAGE_NODE_TOOLBAR.chat.label }}
              </button>
            </div>
            <span class="canvas__node-toolbar-divider" aria-hidden="true" />
            <div class="canvas__node-toolbar-group">
              <template v-for="item in IMAGE_NODE_TOOLBAR.actions" :key="item.key">
                <div v-if="item.key === 'cutout'" class="canvas__node-toolbar-dropdown">
                  <button type="button" class="canvas__node-toolbar-btn">
                    <span
                      class="canvas__node-toolbar-icon"
                      data-icon="cutout"
                      aria-hidden="true"
                    />
                    {{ item.label }}
                  </button>
                  <div class="canvas__node-toolbar-dropdown-menu" @mousedown.stop>
                    <button
                      v-for="mode in IMAGE_CUTOUT_MODES"
                      :key="mode"
                      type="button"
                      class="canvas__node-toolbar-dropdown-item"
                    >
                      {{ mode }}
                    </button>
                  </div>
                </div>
                <div v-else-if="item.key === 'hd'" class="canvas__node-toolbar-hd">
                  <button
                    type="button"
                    class="canvas__node-toolbar-btn"
                    :class="{ 'canvas__node-toolbar-btn--active': showImageHdMenu }"
                    @click="toggleImageHdMenu"
                  >
                    {{ item.label }}
                  </button>
                  <div
                    v-if="showImageHdMenu"
                    class="canvas__node-toolbar-hd-menu"
                    @mousedown.stop
                  >
                    <button
                      v-for="resolution in IMAGE_HD_RESOLUTIONS"
                      :key="resolution"
                      type="button"
                      class="canvas__node-toolbar-hd-item"
                    >
                      {{ resolution }}
                    </button>
                  </div>
                </div>
                <div v-else-if="item.key === 'inpaint'" class="canvas__node-toolbar-tooltip">
                  <button type="button" class="canvas__node-toolbar-btn">
                    <span
                      class="canvas__node-toolbar-icon"
                      data-icon="edit"
                      aria-hidden="true"
                    />
                    {{ item.label }}
                  </button>
                  <span class="canvas__node-toolbar-tooltip-label">{{ item.label }}</span>
                </div>
                <button
                  v-else
                  type="button"
                  class="canvas__node-toolbar-btn"
                  :class="{ 'canvas__node-toolbar-btn--active': item.key === 'crop' && showImageCrop }"
                  @click="onImageToolbarAction(item.key)"
                >
                  <span
                    v-if="item.icon"
                    class="canvas__node-toolbar-icon"
                    :data-icon="item.icon"
                    aria-hidden="true"
                  />
                  {{ item.label }}
                </button>
              </template>
            </div>
            <span class="canvas__node-toolbar-divider" aria-hidden="true" />
            <button type="button" class="canvas__node-toolbar-btn canvas__node-toolbar-btn--icon" title="下载">
              <span class="canvas__node-toolbar-icon" data-icon="download" aria-hidden="true" />
            </button>
          </template>
        </template>
        <template v-else-if="selectedKind === 'video'">
          <div class="canvas__node-toolbar-group">
            <button
              type="button"
              class="canvas__node-toolbar-btn"
              :class="{ 'canvas__node-toolbar-btn--active': showVideoDialogue }"
              @click="toggleVideoDialogue"
            >
              <span class="canvas__node-toolbar-icon" data-icon="chat" aria-hidden="true" />
              {{ VIDEO_NODE_TOOLBAR.chat.label }}
            </button>
          </div>
          <span class="canvas__node-toolbar-divider" aria-hidden="true" />
          <div class="canvas__node-toolbar-group">
            <template v-for="item in VIDEO_NODE_TOOLBAR.actions" :key="item.key">
              <button
                v-if="item.key === 'hd'"
                type="button"
                class="canvas__node-toolbar-btn"
                :class="{ 'canvas__node-toolbar-btn--active': showVideoHdPanel }"
                @click="toggleVideoHdPanel"
              >
                <span
                  class="canvas__node-toolbar-icon"
                  data-icon="video-hd"
                  aria-hidden="true"
                />
                {{ item.label }}
              </button>
              <button
                v-else-if="item.key === 'frames'"
                type="button"
                class="canvas__node-toolbar-btn"
                :class="{ 'canvas__node-toolbar-btn--active': showVideoFramesPanel }"
                @click="toggleVideoFramesPanel"
              >
                <span
                  class="canvas__node-toolbar-icon"
                  data-icon="frames"
                  aria-hidden="true"
                />
                {{ item.label }}
              </button>
              <button v-else type="button" class="canvas__node-toolbar-btn">
                <span
                  v-if="item.icon"
                  class="canvas__node-toolbar-icon"
                  :data-icon="item.icon"
                  aria-hidden="true"
                />
                {{ item.label }}
              </button>
            </template>
          </div>
          <span class="canvas__node-toolbar-divider" aria-hidden="true" />
          <button type="button" class="canvas__node-toolbar-btn canvas__node-toolbar-btn--icon" title="下载">
            <span class="canvas__node-toolbar-icon" data-icon="download" aria-hidden="true" />
          </button>
        </template>
      </template>
      <!-- <button
        v-if="selectedKind !== 'image' && selectedKind !== 'video'"
        type="button"
        class="canvas__node-toolbar-btn canvas__node-toolbar-btn--danger"
        title="删除节点"
        @click="removeSelectedNode"
      >
        🗑
      </button> -->
    </div>

    <aside v-if="showAssetsPanel" class="canvas__assets" @mousedown.stop>
      <div class="canvas__assets-head">
        <button
          type="button"
          :class="{ 'is-active': assetsTab === 'all' }"
          @click="assetsTab = 'all'"
        >
          全部
        </button>
        <button
          type="button"
          :class="{ 'is-active': assetsTab === 'mine' }"
          @click="assetsTab = 'mine'"
        >
          我的素材
        </button>
        <button type="button" class="canvas__assets-close" @click="showAssetsPanel = false">×</button>
      </div>
      <div class="canvas__assets-body">
        <div v-if="assetsLoading" class="canvas__assets-loading">
          <span class="canvas__spinner" />
          <span>加载中...</span>
        </div>
        <p v-else class="canvas__assets-empty">暂无素材，上传后将显示在这里</p>
      </div>
    </aside>

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
        @cancel="closeImageCrop"
        @complete="onImageCropComplete"
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
      <ImageDialoguePanel v-model="imageDialogueText" />
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
      <VideoDialoguePanel v-model="videoDialogueText" />
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
        v-model="videoHdMagnification"
        @close="resetVideoHdPanel"
        @cancel="resetVideoHdPanel"
        @start="onVideoHdStart"
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
        v-model:prompt="imageGenPromptText"
        v-model:seed="imageGenSeed"
        :source-preview-url="imageGenSourcePreviewUrl"
        @update:prompt="persistImageGenPrompt"
        @update:seed="persistImageGenPrompt"
      />
    </div>

    <div
      v-if="showPromptBar"
      class="canvas__prompt"
      :style="{
        left: `${promptPos.left}px`,
        top: `${promptPos.top}px`,
        width: `${promptPos.width}px`,
      }"
      @mousedown.stop
    >
      <textarea
        v-model="promptText"
        class="canvas__prompt-input"
        :placeholder="PROMPT_PLACEHOLDER"
        rows="3"
      />
      <div class="canvas__prompt-footer">
        <span class="canvas__prompt-model">GVLM 3.1</span>
        <div class="canvas__prompt-actions">
          <button type="button" class="canvas__prompt-icon" title="翻译">文</button>
          <span class="canvas__prompt-count">+ 1</span>
          <button type="button" class="canvas__prompt-send" title="发送">↑</button>
        </div>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      class="canvas__file-input"
      accept="image/*,video/*"
      @change="onFileSelected"
    />

    <div class="canvas__toolbar canvas__toolbar--left">
      <button
        type="button"
        class="canvas__tool-btn"
        :class="{ 'canvas__tool-btn--active': showAddMenu }"
        title="添加节点"
        @click="toggleAddMenu"
      >
        +
      </button>
      <button
        type="button"
        class="canvas__tool-btn"
        :class="{ 'canvas__tool-btn--active': showAssetsPanel }"
        title="我的素材"
        @click="toggleAssetsPanel"
      >
        ▤
      </button>
      <button type="button" class="canvas__tool-btn" title="节点图">⎔</button>
      <button type="button" class="canvas__tool-btn" title="历史">◷</button>
      <button type="button" class="canvas__tool-btn" title="帮助">?</button>
    </div>

    <div
      v-if="showConnectMenu"
      class="canvas__connect-menu canvas__connect-menu--floating"
      :style="{ left: `${connectMenuPos.left}px`, top: `${connectMenuPos.top}px` }"
      @mousedown.stop
    >
      <h4 class="canvas__connect-title">引用该节点生成</h4>
      <button
        v-for="item in CONNECT_GENERATE_MENU"
        :key="item.key"
        type="button"
        class="canvas__connect-item"
        :class="{ 'canvas__connect-item--disabled': item.disabled }"
        :disabled="item.disabled"
        @click="onConnectMenuItem(item)"
      >
        <span class="canvas__connect-icon" :data-icon="item.icon" />
        <span class="canvas__connect-label">
          {{ item.label }}
          <em
            v-if="item.badge"
            class="canvas__connect-badge"
            :class="{
              'canvas__connect-badge--new': item.badge === 'NEW',
              'canvas__connect-badge--beta': item.badge === 'Beta',
            }"
          >
            {{ item.badge }}
          </em>
        </span>
      </button>
    </div>

    <div
      v-if="showAddMenu"
      class="canvas__add-menu"
      :class="{ 'canvas__add-menu--floating': Boolean(addMenuDropPoint) }"
      :style="addMenuDropPoint ? { left: `${addMenuPos.left}px`, top: `${addMenuPos.top}px` } : undefined"
      @mousedown.stop
    >
      <section v-for="group in ADD_NODE_GROUPS" :key="group.title" class="canvas__add-group">
        <h4 class="canvas__add-title">{{ group.title }}</h4>
        <button
          v-for="item in group.items"
          :key="`${group.title}-${item.label}`"
          type="button"
          class="canvas__add-item"
          @click="onMenuItem(item)"
        >
          <span class="canvas__add-icon" :data-icon="item.icon" />
          <span class="canvas__add-item-label">
            {{ item.label }}
            <em
              v-if="'badge' in item && item.badge"
              class="canvas__add-badge"
              :class="{
                'canvas__add-badge--new': item.badge === 'NEW',
                'canvas__add-badge--beta': item.badge === 'Beta',
              }"
            >
              {{ item.badge }}
            </em>
          </span>
        </button>
      </section>
    </div>

    <div class="canvas__bottom-left">
      <div
        v-show="showMinimap"
        ref="minimapContainerRef"
        class="canvas__minimap-host"
      />
      <div class="canvas__toolbar canvas__toolbar--bottom">
        <button
          type="button"
          class="canvas__tool-btn canvas__tool-btn--theme"
          @click="toggleCanvasBgTheme"
        >
          <span class="canvas__theme-icon" aria-hidden="true" />
          <span class="canvas__theme-tooltip">画布背景：{{ canvasBgThemeLabel }}</span>
        </button>
        <button
          type="button"
          class="canvas__tool-btn canvas__tool-btn--tidy"
          title="整理画布"
          @click="handleTidyCanvas"
        >
          <span class="canvas__tidy-icon" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        </button>
        <button
          type="button"
          class="canvas__tool-btn"
          :class="{ 'canvas__tool-btn--active': showMinimap }"
          title="画布小地图"
          @click="toggleMinimap"
        >
          <span class="canvas__minimap-icon" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="canvas__tool-btn"
          :class="{ 'canvas__tool-btn--active': gridVisible }"
          title="网格"
          @click="toggleGrid"
        >
          ▦
        </button>
        <button
          type="button"
          class="canvas__tool-btn"
          :class="{ 'canvas__tool-btn--active': panMode }"
          title="拖动画布"
          @click="togglePanMode"
        >
          ✋
        </button>
        <div class="canvas__zoom">
          <button type="button" class="canvas__tool-btn" title="缩小" @click="zoomOut">−</button>
          <div class="canvas__zoom-trigger-wrap">
            <button
              type="button"
              class="canvas__zoom-value-btn"
              :class="{ 'canvas__zoom-value-btn--active': showZoomMenu }"
              :title="`当前缩放 ${zoomPercent}`"
              @click.stop="toggleZoomMenu"
            >
              {{ zoomPercent }}
            </button>
            <div
              v-if="showZoomMenu"
              class="canvas__zoom-menu"
              role="menu"
              @mousedown.stop
            >
              <button
                type="button"
                class="canvas__zoom-menu-item"
                role="menuitem"
                @click="onZoomMenuAction('in')"
              >
                <span>放大</span>
                <kbd class="canvas__zoom-menu-kbd">⌘ +</kbd>
              </button>
              <button
                type="button"
                class="canvas__zoom-menu-item"
                role="menuitem"
                @click="onZoomMenuAction('out')"
              >
                <span>缩小</span>
                <kbd class="canvas__zoom-menu-kbd">⌘ -</kbd>
              </button>
              <button
                type="button"
                class="canvas__zoom-menu-item"
                role="menuitem"
                @click="onZoomMenuAction('fit')"
              >
                <span>适合屏幕</span>
                <kbd class="canvas__zoom-menu-kbd">⇧ 1</kbd>
              </button>
              <div class="canvas__zoom-menu-divider" role="separator" />
              <button
                v-for="preset in ZOOM_MENU_PRESETS"
                :key="preset"
                type="button"
                class="canvas__zoom-menu-item"
                role="menuitem"
                @click="onZoomMenuAction('preset', preset)"
              >
                <span>缩放至{{ Math.round(preset * 100) }}%</span>
              </button>
            </div>
          </div>
          <button type="button" class="canvas__tool-btn" title="放大" @click="zoomIn">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef } from 'vue'
import type { Edge, Graph, Node } from '@antv/x6'
import ImageGenPromptPanel from './ImageGenPromptPanel.vue'
import ImageDialoguePanel from './ImageDialoguePanel.vue'
import ImageCropOverlay from './ImageCropOverlay.vue'
import VideoDialoguePanel from './VideoDialoguePanel.vue'
import VideoHdPanel from './VideoHdPanel.vue'
import VideoFramesPanel from './VideoFramesPanel.vue'
import {
  ADD_NODE_GROUPS,
  CANVAS_PROJECTS,
  CONNECT_GENERATE_MENU,
  IMAGE_NODE_TOOLBAR,
  IMAGE_NODE_TOOLBAR_MORE,
  IMAGE_NODE_TOOLBAR_MORE_MENU,
  IMAGE_HD_RESOLUTIONS,
  IMAGE_CUTOUT_MODES,
  getImageToolbarMoreHover,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  PROMPT_PLACEHOLDER,
  ZOOM_MENU_PRESETS,
  VIDEO_NODE_TOOLBAR,
  type CanvasNodeData,
  type ImageGenTask,
  type NodeKind,
  type VideoHdMagnification,
} from './constants'
import { applyImageGenTask as applyImageGenTaskToNode, spawnCroppedImageNode } from './imageGen'
import {
  canOpenConnectMenu,
  createNodeFromConnectMenu,
  getConnectMenuPosition,
} from './nodeConnect'
import type { ConnectMenuKey } from './constants'
import {
  addCanvasNode,
  bindGraphInteraction,
  createGraph,
  getNodeCropOverlayPosition,
  getNodeDialoguePosition,
  getNodeImageGenPromptPosition,
  getNodePromptPosition,
  getNodeSidePanelPosition,
  getNodeToolbarPosition,
  getScroller,
  graphLocalToContainerOffset,
  type CanvasGraph,
} from './graph'
import {
  applyCanvasBgTheme,
  getCanvasBgThemeMeta,
  type CanvasBgTheme,
} from './canvasTheme'
import { tidyCanvas } from './layout'
import { createMinimap, destroyMinimap } from './minimap'
import { runUploadSimulation } from './upload'
import {
  getCanvasSnapshot,
  saveCanvasSnapshotToStorage,
  type CanvasSnapshot,
} from './canvasSnapshot'

const canvasRef = ref<HTMLElement | null>(null)
const graphRef = ref<HTMLElement | null>(null)
const minimapContainerRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const graph = shallowRef<Graph | null>(null)
const nodeCount = ref(0)
const zoomLevel = ref(1)
const showZoomMenu = ref(false)
const gridVisible = ref(true)
const canvasBgTheme = ref<CanvasBgTheme>('dark')
const panMode = ref(true)
const showMinimap = ref(true)
const showProjectMenu = ref(false)
const canvasProjects = ref([...CANVAS_PROJECTS])
const activeProjectId = ref('draft-2')
const showAddMenu = ref(false)
const showConnectMenu = ref(false)
const connectMenuPos = ref({ left: 0, top: 0 })
const connectReleasePoint = ref<{ x: number; y: number } | null>(null)
const addMenuPos = ref({ left: 0, top: 0 })
const addMenuDropPoint = ref<{ x: number; y: number } | null>(null)
const connectSourceNodeId = ref('')
const connectDropPoint = ref<{ x: number; y: number } | null>(null)
const showAssetsPanel = ref(false)
const assetsTab = ref<'all' | 'mine'>('mine')
const assetsLoading = ref(false)
const promptText = ref('')
const activePickerNodeId = ref('')
const activeImageGenPromptNodeId = ref('')
const imageGenPromptText = ref('')
const imageGenSeed = ref(58)
const imageGenSourcePreviewUrl = ref('')
const selectedNodeId = ref('')
const pendingUploadNodeId = ref('')
const toolbarPos = ref({ left: 0, top: 0 })
const dialoguePos = ref({ left: 0, top: 0, width: 360 })
const promptPos = ref({ left: 0, top: 0, width: 360 })
const imageGenPromptPos = ref({ left: 0, top: 0, width: 480 })
const imageCropPos = ref({ left: 0, top: 0, width: 360, height: 420 })
const videoHdPos = ref({ left: 0, top: 0, width: 320 })
const selectedKind = ref<NodeKind | null>(null)
const showImageToolbarMore = ref(false)
const showImageToolbarMoreMenu = ref(false)
const showImageHdMenu = ref(false)
const showImageDialogue = ref(false)
const showImageCrop = ref(false)
const cropSourceNodeId = ref('')
const showVideoDialogue = ref(false)
const showVideoHdPanel = ref(false)
const showVideoFramesPanel = ref(false)
const imageDialogueText = ref('')
const videoDialogueText = ref('')
const videoHdMagnification = ref<VideoHdMagnification>('2')
const canvasCredits = ref(12003)

const zoomPercent = computed(() => `${Math.round(zoomLevel.value * 100)}%`)
const currentProjectName = computed(
  () => canvasProjects.value.find((project) => project.id === activeProjectId.value)?.name ?? '未命名创作',
)
const canvasBgThemeLabel = computed(
  () => getCanvasBgThemeMeta(canvasBgTheme.value).label,
)
const showPromptBar = computed(
  () => Boolean(activePickerNodeId.value) && nodeCount.value > 0 && !showImageCrop.value,
)
const showImageGenPromptBar = computed(
  () => Boolean(activeImageGenPromptNodeId.value) && nodeCount.value > 0 && !showImageCrop.value,
)

const imageCropSource = computed(() => {
  const data = getSelectedNodeData()
  if (!data?.previewUrl || !data.mediaWidth || !data.mediaHeight) return null
  return {
    previewUrl: data.previewUrl,
    mediaWidth: data.mediaWidth,
    mediaHeight: data.mediaHeight,
  }
})

const showNodeToolbar = computed(() => Boolean(selectedNodeId.value))
const toolbarRevision = ref(0)

function getSelectedNodeData(): CanvasNodeData | undefined {
  const id = selectedNodeId.value
  if (!id) return undefined
  return graph.value?.getCellById(id)?.getData() as CanvasNodeData | undefined
}

function canShowImageToolbar(data: CanvasNodeData | undefined) {
  if (!data || data.kind !== 'image') return false
  if (data.imageGenTask === 'picker') return false
  if (data.imageGenTask === 'img2img' || data.imageGenTask === 'hd') return true
  return data.mode === 'editor'
}

function bumpToolbarRevision() {
  toolbarRevision.value += 1
}

const showToolbarFeatureButtons = computed(() => {
  void toolbarRevision.value

  if (selectedKind.value === 'image' && selectedNodeId.value) {
    return canShowImageToolbar(getSelectedNodeData())
  }
  if (selectedKind.value !== 'video' || !selectedNodeId.value) return false
  const data = getSelectedNodeData()
  return data?.mode !== 'picker'
})

const isLightNodeToolbar = computed(
  () =>
    (selectedKind.value === 'image' || selectedKind.value === 'video') &&
    showToolbarFeatureButtons.value,
)

function openImageToolbarMore() {
  showImageToolbarMore.value = true
  showImageToolbarMoreMenu.value = false
  showImageHdMenu.value = false
}

function closeImageToolbarMore() {
  showImageToolbarMore.value = false
  showImageToolbarMoreMenu.value = false
}

function toggleImageToolbarMoreMenu() {
  showImageToolbarMoreMenu.value = !showImageToolbarMoreMenu.value
}

function toggleImageHdMenu() {
  showImageHdMenu.value = !showImageHdMenu.value
  if (showImageHdMenu.value) {
    showImageToolbarMoreMenu.value = false
  }
}

function onImageToolbarAction(key: string) {
  showImageHdMenu.value = false
  if (key === 'more') {
    openImageToolbarMore()
    return
  }
  if (key === 'crop') {
    openImageCrop()
  }
}

function openImageCrop() {
  const data = getSelectedNodeData()
  if (!data?.previewUrl || !data.mediaWidth || !data.mediaHeight) return

  showImageHdMenu.value = false
  showImageDialogue.value = false
  showImageToolbarMore.value = false
  showImageToolbarMoreMenu.value = false
  cropSourceNodeId.value = selectedNodeId.value
  showImageCrop.value = true
  updateNodeToolbar()
}

function closeImageCrop() {
  showImageCrop.value = false
  cropSourceNodeId.value = ''
  updateNodeToolbar()
}

function resetImageCrop() {
  showImageCrop.value = false
  cropSourceNodeId.value = ''
}

function onImageCropComplete(payload: { dataUrl: string; width: number; height: number }) {
  const g = graph.value
  const id = cropSourceNodeId.value || selectedNodeId.value
  if (!g || !id) {
    closeImageCrop()
    return
  }

  const cell = g.getCellById(id)
  if (!cell?.isNode()) {
    closeImageCrop()
    return
  }

  const sourceNode = cell as Node
  const croppedNode = spawnCroppedImageNode(g, sourceNode, payload)
  selectedNodeId.value = croppedNode.id
  selectedKind.value = 'image'
  syncNodeSelectionHighlight(croppedNode.id)
  syncNodeCount()
  closeImageCrop()

  nextTick(() => {
    const scroller = getScroller(g)
    const bbox = croppedNode.getBBox()
    scroller?.transitionToPoint(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, {
      duration: '280ms',
    })
    updateNodeToolbar()
  })
}

function resetImageToolbarMore() {
  showImageToolbarMore.value = false
  showImageToolbarMoreMenu.value = false
  showImageHdMenu.value = false
}

function closeVideoSubPanels(except?: 'dialogue' | 'hd' | 'frames') {
  if (except !== 'dialogue') showVideoDialogue.value = false
  if (except !== 'hd') showVideoHdPanel.value = false
  if (except !== 'frames') showVideoFramesPanel.value = false
}

function toggleImageDialogue() {
  showImageDialogue.value = !showImageDialogue.value
  showImageHdMenu.value = false
  if (showImageDialogue.value) {
    updateNodeToolbar()
  }
}

function toggleVideoDialogue() {
  showVideoDialogue.value = !showVideoDialogue.value
  if (showVideoDialogue.value) {
    closeVideoSubPanels('dialogue')
    updateNodeToolbar()
  }
}

function toggleVideoHdPanel() {
  showVideoHdPanel.value = !showVideoHdPanel.value
  if (showVideoHdPanel.value) {
    closeVideoSubPanels('hd')
    updateNodeToolbar()
  }
}

function toggleVideoFramesPanel() {
  showVideoFramesPanel.value = !showVideoFramesPanel.value
  if (showVideoFramesPanel.value) {
    closeVideoSubPanels('frames')
    updateNodeToolbar()
  }
}

function resetVideoHdPanel() {
  showVideoHdPanel.value = false
}

function resetVideoFramesPanel() {
  showVideoFramesPanel.value = false
}

function onVideoHdStart() {
  resetVideoHdPanel()
}

function resetImageDialogue() {
  showImageDialogue.value = false
}

function resetVideoDialogue() {
  showVideoDialogue.value = false
}

function requestCanvasUpload(nodeId: string) {
  pendingUploadNodeId.value = nodeId
  fileInputRef.value?.click()
}

provide('requestCanvasUpload', requestCanvasUpload)

function loadImageGenPromptFields(nodeId: string) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = cell.getData() as CanvasNodeData
  imageGenPromptText.value = data.genPrompt ?? ''
  imageGenSeed.value = data.genSeed ?? 58
  imageGenSourcePreviewUrl.value = data.sourcePreviewUrl ?? ''
}

function persistImageGenPrompt() {
  const g = graph.value
  const nodeId = activeImageGenPromptNodeId.value
  if (!g || !nodeId) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  const data = { ...(cell.getData() as CanvasNodeData) }
  data.genPrompt = imageGenPromptText.value
  data.genSeed = imageGenSeed.value
  cell.setData(data)
}

function openImageGenPromptBar(nodeId: string) {
  activeImageGenPromptNodeId.value = nodeId
  activePickerNodeId.value = ''
  loadImageGenPromptFields(nodeId)
  updateImageGenPromptBarPosition()
}

function closeImageGenPromptBar() {
  activeImageGenPromptNodeId.value = ''
}

function handleApplyImageGenTask(nodeId: string, task: ImageGenTask) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  applyImageGenTaskToNode(cell as Node, task)
  selectedNodeId.value = nodeId
  if (task === 'img2img') {
    openImageGenPromptBar(nodeId)
  } else {
    closeImageGenPromptBar()
  }
  updateNodeToolbar()
}

provide('applyImageGenTask', handleApplyImageGenTask)

function removeConnectPreviewEdge() {
  const g = graph.value as CanvasGraph | null
  if (!g?.__connectPreviewEdgeId) return
  const edge = g.getCellById(g.__connectPreviewEdgeId)
  if (edge?.isEdge()) g.removeEdge(edge)
  g.__connectPreviewEdgeId = ''
}

function syncConnectPreviewEdgeTarget() {
  const g = graph.value as CanvasGraph | null
  if (!g?.__connectPreviewEdgeId || !canvasRef.value) return
  const edge = g.getCellById(g.__connectPreviewEdgeId)
  if (!edge?.isEdge()) return

  const rect = canvasRef.value.getBoundingClientRect()
  const clientX = rect.left + connectMenuPos.value.left
  const clientY = rect.top + connectMenuPos.value.top
  edge.setTarget(g.clientToLocal(clientX, clientY))
}

function closeConnectMenu() {
  removeConnectPreviewEdge()
  showConnectMenu.value = false
  connectSourceNodeId.value = ''
  connectDropPoint.value = null
  connectReleasePoint.value = null
}

function closeAddMenu() {
  showAddMenu.value = false
  addMenuDropPoint.value = null
}

function toggleProjectMenu() {
  showProjectMenu.value = !showProjectMenu.value
}

function closeProjectMenu() {
  showProjectMenu.value = false
}

function closeZoomMenu() {
  showZoomMenu.value = false
}

function toggleZoomMenu() {
  showZoomMenu.value = !showZoomMenu.value
}

function applyZoomAfterChange() {
  syncZoom()
  updateNodeToolbar()
}

function zoomToScale(scale: number) {
  const g = graph.value
  if (!g) return
  const clamped = Math.min(CANVAS_MAX_ZOOM, Math.max(CANVAS_MIN_ZOOM, scale))
  g.zoomTo(clamped)
  applyZoomAfterChange()
}

function zoomFitToScreen() {
  const g = graph.value
  if (!g) return
  g.zoomToFit({
    padding: 48,
    maxScale: CANVAS_MAX_ZOOM,
    minScale: CANVAS_MIN_ZOOM,
  })
  applyZoomAfterChange()
}

function onZoomMenuAction(
  action: 'in' | 'out' | 'fit' | 'preset',
  preset?: (typeof ZOOM_MENU_PRESETS)[number],
) {
  if (action === 'in') zoomIn()
  else if (action === 'out') zoomOut()
  else if (action === 'fit') zoomFitToScreen()
  else if (preset != null) zoomToScale(preset)
  closeZoomMenu()
}

function selectProject(projectId: string) {
  activeProjectId.value = projectId
  closeProjectMenu()
}

function handleSaveCanvas() {
  const g = graph.value
  if (!g) return

  const snapshot: CanvasSnapshot = getCanvasSnapshot(g, {
    projectId: activeProjectId.value,
    projectName: currentProjectName.value,
    canvasBgTheme: canvasBgTheme.value,
    gridVisible: gridVisible.value,
    panMode: panMode.value,
    showMinimap: showMinimap.value,
  })

  saveCanvasSnapshotToStorage(snapshot)

  const project = canvasProjects.value.find((item) => item.id === activeProjectId.value)
  if (project) {
    project.saved = true
  }

  console.info('[Canvas] saved snapshot', snapshot)
}

function handleExportCanvas() {
  const g = graph.value
  if (!g) return

  const snapshot = getCanvasSnapshot(g, {
    projectId: activeProjectId.value,
    projectName: currentProjectName.value,
    canvasBgTheme: canvasBgTheme.value,
    gridVisible: gridVisible.value,
    panMode: panMode.value,
    showMinimap: showMinimap.value,
  })

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${activeProjectId.value || 'canvas'}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function openAddMenuAtGraphPoint(graphPoint: { x: number; y: number }) {
  const g = graph.value
  const overlayRoot = canvasRef.value
  if (!g || !overlayRoot) return

  closeConnectMenu()
  addMenuDropPoint.value = graphPoint

  const offset = graphLocalToContainerOffset(g, graphPoint.x, graphPoint.y, overlayRoot)
  const rect = overlayRoot.getBoundingClientRect()
  const menuWidth = 220
  const menuHeight = 420
  addMenuPos.value = {
    left: Math.max(12, Math.min(offset.left, rect.width - menuWidth - 12)),
    top: Math.max(60, Math.min(offset.top, rect.height - menuHeight - 12)),
  }
  showAddMenu.value = true
}

function updateAddMenuPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const drop = addMenuDropPoint.value
  if (!g || !overlayRoot || !showAddMenu.value || !drop) return

  const offset = graphLocalToContainerOffset(g, drop.x, drop.y, overlayRoot)
  const rect = overlayRoot.getBoundingClientRect()
  const menuWidth = 220
  const menuHeight = 420
  addMenuPos.value = {
    left: Math.max(12, Math.min(offset.left, rect.width - menuWidth - 12)),
    top: Math.max(60, Math.min(offset.top, rect.height - menuHeight - 12)),
  }
}

function updateConnectMenuPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const release = connectReleasePoint.value
  if (!g || !overlayRoot || !showConnectMenu.value || !release) return

  const source = g.getCellById(connectSourceNodeId.value)
  if (!source?.isNode()) return

  const { left, top } = getConnectMenuPosition(g, source as Node, overlayRoot, release)
  connectMenuPos.value = { left, top }
  syncConnectPreviewEdgeTarget()
}

function openConnectMenu(source: Node, releasePoint: { x: number; y: number }) {
  const g = graph.value
  const overlayRoot = canvasRef.value
  if (!g || !overlayRoot) return

  closeAddMenu()
  connectSourceNodeId.value = source.id
  connectReleasePoint.value = releasePoint
  const { left, top, dropPoint } = getConnectMenuPosition(
    g,
    source,
    overlayRoot,
    releasePoint,
  )
  connectDropPoint.value = dropPoint
  connectMenuPos.value = { left, top }
  showConnectMenu.value = true
  ;(g as CanvasGraph).__suppressBlankCloseForConnect = true
  nextTick(() => syncConnectPreviewEdgeTarget())
}

function finishConnectSpawn(node: Node) {
  selectedNodeId.value = node.id
  syncNodeSelectionHighlight(node.id)
  updateNodeToolbar()
  syncNodeCount()
  closeConnectMenu()
}

function onConnectMenuItem(item: (typeof CONNECT_GENERATE_MENU)[number]) {
  if (item.disabled) return

  const g = graph.value
  const sourceId = connectSourceNodeId.value
  const point = connectDropPoint.value
  if (!g || !sourceId || !point) return

  const source = g.getCellById(sourceId)
  if (!source?.isNode()) return

  const spawned = createNodeFromConnectMenu(
    g,
    source as Node,
    point,
    item.key as ConnectMenuKey,
  )
  if (!spawned) return

  const data = spawned.getData() as CanvasNodeData
  if (data.mode === 'picker' && (data.kind === 'text' || data.kind === 'audio')) {
    activePickerNodeId.value = spawned.id
  }

  finishConnectSpawn(spawned)
}

function openConnectMenuByNodeId(nodeId: string, releasePoint: { x: number; y: number }) {
  const g = graph.value
  if (!g) return
  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return
  openConnectMenu(cell as Node, releasePoint)
}

provide('openConnectMenuByNodeId', openConnectMenuByNodeId)

function getEdgeReleasePoint(edge: Edge) {
  const target = edge.getTarget()
  if (target && typeof target === 'object' && 'x' in target && 'y' in target) {
    return { x: Number(target.x), y: Number(target.y) }
  }
  return null
}

function handleEdgeConnected({
  edge,
  isNew,
  currentCell,
  currentPoint,
}: {
  edge: Edge
  isNew?: boolean
  currentCell?: { isNode?: () => boolean } | null
  currentPoint?: { x: number; y: number } | null
}) {
  if (!isNew) return

  if (currentCell?.isNode?.()) return

  const g = graph.value
  if (!g) return

  const source = edge.getSourceCell()
  if (!source?.isNode() || !canOpenConnectMenu(source as Node)) {
    g.removeEdge(edge.id)
    return
  }

  const canvasGraph = g as CanvasGraph
  if (canvasGraph.__connectPreviewEdgeId === edge.id && showConnectMenu.value) return

  const releasePoint = currentPoint ?? getEdgeReleasePoint(edge)
  if (!releasePoint) return

  canvasGraph.__connectPreviewEdgeId = edge.id
  openConnectMenu(source as Node, releasePoint)
}

function removeNodeById(nodeId: string) {
  const g = graph.value
  if (!g || !nodeId) return

  const cell = g.getCellById(nodeId)
  if (!cell?.isNode()) return

  g.removeCell(cell)
  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = ''
    selectedKind.value = null
    syncNodeSelectionHighlight('')
  }
  if (activePickerNodeId.value === nodeId) {
    activePickerNodeId.value = ''
  }
  if (activeImageGenPromptNodeId.value === nodeId) {
    closeImageGenPromptBar()
  }
  syncNodeCount()
}

provide('deleteCanvasNode', removeNodeById)

function syncNodeCount() {
  nodeCount.value = graph.value?.getNodes().length ?? 0
  if (nodeCount.value === 0) {
    activePickerNodeId.value = ''
    closeImageGenPromptBar()
    selectedNodeId.value = ''
  }
}

function syncZoom(scale?: number) {
  if (typeof scale === 'number' && !Number.isNaN(scale)) {
    zoomLevel.value = scale
    return
  }
  zoomLevel.value = graph.value?.zoom() ?? 1
}

function getGraphCenter() {
  const g = graph.value
  if (!g || !graphRef.value) return { x: 400, y: 320 }
  const { width, height } = graphRef.value.getBoundingClientRect()
  return g.clientToLocal(width / 2, height / 2)
}

function syncNodeSelectionHighlight(nodeId: string) {
  const g = graph.value
  if (!g) return

  g.getNodes().forEach((node) => {
    const data = node.getData() as CanvasNodeData
    const isSelected = node.id === nodeId
    if (Boolean(data.isSelected) === isSelected) return
    node.setData({ ...data, isSelected })
  })
}

function updatePromptBarPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const id = activePickerNodeId.value
  if (!g || !overlayRoot || !id) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return

  promptPos.value = getNodePromptPosition(g, cell as Node, overlayRoot)
}

function updateImageGenPromptBarPosition() {
  const g = graph.value
  const overlayRoot = canvasRef.value
  const id = activeImageGenPromptNodeId.value
  if (!g || !overlayRoot || !id) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return

  imageGenPromptPos.value = getNodeImageGenPromptPosition(g, cell as Node, overlayRoot)
}

function updateNodeToolbar() {
  updatePromptBarPosition()
  updateImageGenPromptBarPosition()
  updateAddMenuPosition()
  updateConnectMenuPosition()

  const g = graph.value
  const overlayRoot = canvasRef.value
  const id = selectedNodeId.value
  if (!g || !overlayRoot || !id) return

  const cell = g.getCellById(id)
  if (!cell?.isNode()) return

  const data = cell.getData() as CanvasNodeData
  selectedKind.value = data.kind
  const node = cell as Node
  toolbarPos.value = getNodeToolbarPosition(g, node, overlayRoot)
  dialoguePos.value = getNodeDialoguePosition(g, node, overlayRoot)
  if (showImageCrop.value) {
    imageCropPos.value = getNodeCropOverlayPosition(g, node, overlayRoot)
  }
  if (data.kind === 'video' && showVideoHdPanel.value) {
    videoHdPos.value = getNodeSidePanelPosition(g, node, overlayRoot)
  }
}

function addNode(kind: NodeKind, point?: { x: number; y: number }) {
  const g = graph.value
  if (!g) return

  const position = point ?? addMenuDropPoint.value ?? getGraphCenter()
  const overrides: Partial<CanvasNodeData> =
    kind === 'image'
      ? { mode: 'picker', imageGenTask: 'picker' }
      : {}
  const node = addCanvasNode(g, kind, position, overrides)
  const data = node.getData() as CanvasNodeData

  if (data.mode === 'picker' && (kind === 'text' || kind === 'audio')) {
    activePickerNodeId.value = node.id
  }

  selectedNodeId.value = node.id
  updateNodeToolbar()
  closeAddMenu()
  syncNodeCount()
  return node
}

function addFromMenu(kind: NodeKind) {
  const drop = addMenuDropPoint.value
  if (drop) {
    addNode(kind, drop)
    return
  }

  const center = getGraphCenter()
  addNode(kind, {
    x: center.x + (Math.random() - 0.5) * 100,
    y: center.y + (Math.random() - 0.5) * 80,
  })
}

function onMenuItem(item: (typeof ADD_NODE_GROUPS)[number]['items'][number]) {
  if ('action' in item && item.action === 'upload') {
    pendingUploadNodeId.value = ''
    fileInputRef.value?.click()
    showAddMenu.value = false
    return
  }
  if ('action' in item && item.action === 'history') {
    closeAddMenu()
    openAssetsPanel()
    return
  }
  addFromMenu(item.kind)
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !graph.value) return

  const isVideo = file.type.startsWith('video/')
  const kind: NodeKind = isVideo ? 'video' : 'image'

  let node: Node | undefined
  if (pendingUploadNodeId.value) {
    const cell = graph.value.getCellById(pendingUploadNodeId.value)
    if (cell?.isNode()) node = cell as Node
  }

  if (!node) {
    const created = addNode(kind, addMenuDropPoint.value ?? undefined)
    if (!created) return
    node = created
  } else {
    const data = { ...(node.getData() as CanvasNodeData) }
    data.mode = 'editor'
    node.setData(data)
  }

  pendingUploadNodeId.value = ''
  addMenuDropPoint.value = null
  selectedNodeId.value = node.id
  runUploadSimulation(node, file)
  updateNodeToolbar()
}

function toggleAddMenu() {
  if (showAddMenu.value) {
    closeAddMenu()
    return
  }

  addMenuDropPoint.value = null
  showAddMenu.value = true
  showAssetsPanel.value = false
  closeConnectMenu()
}

function openAssetsPanel() {
  showAssetsPanel.value = true
  closeAddMenu()
  assetsLoading.value = true
  window.setTimeout(() => {
    assetsLoading.value = false
  }, 800)
}

function toggleAssetsPanel() {
  if (showAssetsPanel.value) {
    showAssetsPanel.value = false
  } else {
    openAssetsPanel()
  }
}

function togglePanMode() {
  panMode.value = !panMode.value
  const scroller = graph.value ? getScroller(graph.value) : null
  if (!scroller) return
  scroller.togglePanning(panMode.value)
}

function handleTidyCanvas() {
  const g = graph.value
  if (!g || g.getNodes().length === 0) return
  tidyCanvas(g)
  updateNodeToolbar()
}

async function setupMinimap() {
  const g = graph.value
  const container = minimapContainerRef.value
  if (!g || !container || !showMinimap.value) return

  if (g.getPlugin('minimap')) {
    destroyMinimap(g)
  }

  await nextTick()
  createMinimap(g, container, canvasBgTheme.value)
}

async function toggleCanvasBgTheme() {
  canvasBgTheme.value = canvasBgTheme.value === 'dark' ? 'light' : 'dark'
  applyCanvasBgTheme(graph.value, canvasBgTheme.value, gridVisible.value)

  if (showMinimap.value) {
    teardownMinimap()
    await setupMinimap()
  }
}

function teardownMinimap() {
  const g = graph.value
  if (!g || !g.getPlugin('minimap')) return
  destroyMinimap(g)
}

async function toggleMinimap() {
  showMinimap.value = !showMinimap.value
  if (showMinimap.value) {
    await setupMinimap()
  } else {
    teardownMinimap()
  }
}

function toggleGrid() {
  const g = graph.value
  if (!g) return
  gridVisible.value = !gridVisible.value
  if (gridVisible.value) {
    g.showGrid()
    applyCanvasBgTheme(g, canvasBgTheme.value, gridVisible.value)
  } else {
    g.hideGrid()
  }
}

function zoomIn() {
  graph.value?.zoom(0.12)
  applyZoomAfterChange()
}

function zoomOut() {
  graph.value?.zoom(-0.12)
  applyZoomAfterChange()
}

function removeSelectedNode() {
  const id = selectedNodeId.value
  if (!id) return
  removeNodeById(id)
}

function handleBlankDblClick(event: { x: number; y: number }) {
  openAddMenuAtGraphPoint({ x: event.x, y: event.y })
}

function handleNodeClick({ node }: { node: Node }) {
  const data = node.getData() as CanvasNodeData
  selectedNodeId.value = node.id
  selectedKind.value = data.kind
  resetImageToolbarMore()
  resetImageDialogue()
  resetImageCrop()
  resetVideoDialogue()
  resetVideoHdPanel()
  resetVideoFramesPanel()
  bumpToolbarRevision()

  const showImageGenPrompt =
    data.kind === 'image' &&
    data.imageGenTask !== 'hd' &&
    (data.imageGenTask === 'picker' ||
      data.imageGenTask === 'img2img' ||
      (!data.imageGenTask && !data.previewUrl && data.uploadState !== 'uploading'))

  if (showImageGenPrompt) {
    if (data.imageGenTask !== 'img2img') {
      applyImageGenTaskToNode(node, 'img2img')
    }
    openImageGenPromptBar(node.id)
  } else {
    closeImageGenPromptBar()
    activePickerNodeId.value =
      data.mode === 'picker' && (data.kind === 'text' || data.kind === 'audio') ? node.id : ''
  }

  syncNodeSelectionHighlight(node.id)
  updateNodeToolbar()
}

function handleNodeUnselected() {
  activePickerNodeId.value = ''
  closeImageGenPromptBar()
}

function handleBlankClick() {
  closeAddMenu()
  closeProjectMenu()
  closeZoomMenu()
  const g = graph.value as CanvasGraph | null
  if (g?.__suppressBlankCloseForConnect) {
    g.__suppressBlankCloseForConnect = false
  } else {
    closeConnectMenu()
  }
  selectedNodeId.value = ''
  selectedKind.value = null
  resetImageToolbarMore()
  resetImageDialogue()
  resetImageCrop()
  resetVideoDialogue()
  resetVideoHdPanel()
  resetVideoFramesPanel()
  closeImageGenPromptBar()
  syncNodeSelectionHighlight('')
}

function handleNodeDataChange({ node }: { node: Node }) {
  const data = node.getData() as CanvasNodeData
  if (data.mode === 'editor' && activePickerNodeId.value === node.id) {
    activePickerNodeId.value = ''
  }
  if (selectedNodeId.value === node.id) {
    selectedKind.value = data.kind
    bumpToolbarRevision()
    updateNodeToolbar()
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target
  if (isEditableTarget(target)) return

  const mod = event.metaKey || event.ctrlKey

  if (mod && (event.key === '=' || event.key === '+')) {
    event.preventDefault()
    zoomIn()
    return
  }
  if (mod && event.key === '-') {
    event.preventDefault()
    zoomOut()
    return
  }
  if (event.shiftKey && event.key === '1' && !mod && !event.altKey) {
    event.preventDefault()
    zoomFitToScreen()
    return
  }

  if (event.key !== 'Delete' && event.key !== 'Backspace') return
  if (!selectedNodeId.value) return
  event.preventDefault()
  removeSelectedNode()
}

let scrollerScrollTarget: HTMLElement | null = null

function bindScrollerScrollListener(g: Graph) {
  const scroller = getScroller(g)
  if (!scroller) return
  scrollerScrollTarget = scroller.container
  scrollerScrollTarget.addEventListener('scroll', updateNodeToolbar, { passive: true })
}

function unbindScrollerScrollListener() {
  if (!scrollerScrollTarget) return
  scrollerScrollTarget.removeEventListener('scroll', updateNodeToolbar)
  scrollerScrollTarget = null
}

onMounted(() => {
  if (!graphRef.value) return

  const instance = createGraph(graphRef.value) as CanvasGraph
  instance.__openConnectMenu = openConnectMenuByNodeId
  graph.value = instance
  bindGraphInteraction(instance)
  bindScrollerScrollListener(instance)

  instance.on('blank:dblclick', handleBlankDblClick)
  instance.on('scale', ({ sx }) => {
    syncZoom(sx)
    requestAnimationFrame(() => updateNodeToolbar())
  })
  instance.on('translate', updateNodeToolbar)
  instance.on('node:moving', updateNodeToolbar)
  instance.on('node:moved', updateNodeToolbar)
  instance.on('node:added', syncNodeCount)
  instance.on('node:removed', syncNodeCount)
  instance.on('node:click', handleNodeClick)
  instance.on('blank:click', () => {
    handleBlankClick()
    handleNodeUnselected()
  })
  instance.on('node:change:data', handleNodeDataChange)
  instance.on('edge:connected', handleEdgeConnected)

  window.addEventListener('keydown', handleKeydown)

  const scroller = getScroller(instance)
  scroller?.togglePanning(panMode.value)

  syncZoom()
  syncNodeCount()

  if (showMinimap.value) {
    nextTick(() => setupMinimap())
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  unbindScrollerScrollListener()
  teardownMinimap()
  graph.value?.dispose()
  graph.value = null
})
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
