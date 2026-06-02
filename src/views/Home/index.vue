<template>
  <div class="home">
    <div class="home__content">
      <section class="home__hero">
        <div class="home__hero-brand">
          <span class="home__hero-logo" aria-hidden="true" />
          <h1 class="home__hero-title">Daone 电商视觉 AI 生产平台</h1>
          <p class="home__hero-subtitle">生产真正懂审美、能卖货的视觉内容</p>
          <div>
            <button type="button" class="home__hero-btn" title="登录" @click="openNewProject">开始创作</button>
            <button type="button" class="home__hero-btn" title="教程">教程</button>
          </div>
        </div>
      </section>

      <section class="home__section">
        <h2 class="home__section-title">最近项目</h2>
        <div class="home__projects">
          <button type="button" class="home__project-card home__project-card--new" @click="openNewProject">
            <span class="home__project-new-icon" aria-hidden="true">+</span>
            <span class="home__project-new-label">新建项目</span>
          </button>

          <button
            v-for="project in recentProjects"
            :key="project.id"
            type="button"
            class="home__project-card"
            @click="openProject(project.id)"
          >
            <span class="home__project-cover" aria-hidden="true" />
            <span class="home__project-name">{{ project.name }}</span>
            <span class="home__project-meta">更新于 {{ project.updatedAt }}</span>
          </button>
        </div>
      </section>

      <section class="home__section home__section--inspiration">
        <h2 class="home__section-title">灵感发现</h2>

        <div class="home__filters">
          <button
            v-for="category in HOME_INSPIRATION_CATEGORIES"
            :key="category.key"
            type="button"
            class="home__filter-btn"
            :class="{ 'home__filter-btn--active': activeCategory === category.key }"
            @click="activeCategory = category.key"
          >
            {{ category.label }}
          </button>
        </div>

        <div class="home__inspiration-grid">
          <article
            v-for="item in filteredInspiration"
            :key="item.id"
            class="home__inspiration-card"
            @click="openInspiration(item.id)"
          >
            <div class="home__inspiration-media">
              <img
                class="home__inspiration-image"
                :src="item.image"
                :alt="`${item.author} 的作品`"
                loading="lazy"
                :style="{ height: `${item.imageHeight}px` }"
              />
            </div>
            <div class="home__inspiration-footer">
              <div class="home__inspiration-author">
                <img class="home__inspiration-avatar" :src="item.avatar" :alt="item.author" loading="lazy" />
                <span class="home__inspiration-name">{{ item.author }}</span>
              </div>
              <div class="home__inspiration-stats">
                <span class="home__inspiration-stat">
                  <span class="home__inspiration-stat-icon home__inspiration-stat-icon--view" aria-hidden="true" />
                  {{ formatCount(item.views) }}
                </span>
                <span class="home__inspiration-stat">
                  <span class="home__inspiration-stat-icon home__inspiration-stat-icon--like" aria-hidden="true" />
                  {{ formatCount(item.likes) }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  HOME_HERO_PLACEHOLDER,
  HOME_INSPIRATION_CATEGORIES,
  HOME_INSPIRATION_ITEMS,
  HOME_QUICK_ACTIONS,
  HOME_RECENT_PROJECTS,
  type HomeInspirationCategory,
} from './homeData'

const router = useRouter()
const recentProjects = HOME_RECENT_PROJECTS
const activeCategory = ref<HomeInspirationCategory>('all')
const promptText = ref('')

const filteredInspiration = computed(() => {
  if (activeCategory.value === 'all') {
    return HOME_INSPIRATION_ITEMS
  }
  return HOME_INSPIRATION_ITEMS.filter((item) => item.category === activeCategory.value)
})

function formatCount(value: number) {
  return value.toLocaleString('en-US')
}

function openNewProject() {
  router.push({ name: 'createOrEdit' })
}

function submitPrompt() {
  openNewProject()
}

function applyQuickAction(label: string) {
  promptText.value = `让星流 ${label}`
}

function openProject(id: string) {
  router.push({ name: 'createOrEdit', params: { id } })
}

const openInspiration = (id: string) => {
  router.push({ name: 'createOrEdit', params: { id } })
}
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
