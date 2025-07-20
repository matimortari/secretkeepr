<template>
  <div
    v-motion class="min-h-screen"
    :initial="{ opacity: 0 }" :enter="{ opacity: 1 }"
    :duration="800"
  >
    <div class="flex flex-col gap-2">
      <header
        v-motion class="navigation-group justify-between border-b pb-2 flex-nowrap"
        :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
        :duration="800" :delay="200"
      >
        <div class="navigation-group shrink-0">
          <NuxtLink :to="`/admin/${project?.id}`">
            <Icon name="ph:arrow-left-bold" size="25" class="text-muted-foreground hover:text-accent md:mt-2" />
          </NuxtLink>
          <h2 class="truncate max-w-lg">
            {{ project?.name }}
          </h2>
        </div>

        <p
          v-motion class="text-muted-foreground text-xs max-w-lg line-clamp-2 tracking-tight leading-4"
          :initial="{ opacity: 0, x: -10 }" :enter="{ opacity: 1, x: 0 }"
          :duration="800"
        >
          {{ project?.description || "No description provided." }}
        </p>
      </header>

      <div
        v-motion class="flex flex-col gap-2"
        :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
        :duration="800" :delay="200"
      >
        <ProjectsProjectDetails :project="project" />
        <ProjectsProjectDangerZone v-if="currentUserId === projectOwnerId" :project="project" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"

const route = useRoute()
const projectId = route.params.project as string
const userStore = useUserStore()
const projectsStore = useProjectsStore()

const { projects } = storeToRefs(useProjectsStore())

const currentUserId = computed(() => userStore.user?.id)

const project = computed(() => {
  return projects.value.find(p => p.id === projectId) || null
})

const projectOwnerId = computed(() => {
  return project.value?.members?.find(m => m.role === "owner")?.userId || null
})

watch(() => projectId, async (id) => {
  await projectsStore.getProjects()

  const projectName = projectsStore.projects?.find(p => p.id === id)
  const titleName = projectName?.name ?? "SecretKeepR"

  useHead({
    title: `${titleName} | Settings – SecretKeepR`,
    link: [{ rel: "canonical", href: `https://secretkeepr.vercel.app/${id}/settings` }, { rel: "icon", href: "/favicon.ico" }],
    meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
  })

  useSeoMeta({
    title: `${titleName} | Settings – SecretKeepR`,
    description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
  })
}, { immediate: true })

definePageMeta({
  layout: "admin",
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: "/sign-in",
  },
})
</script>
