<template>
  <div
    v-motion class="min-h-screen"
    :initial="{ opacity: 0 }" :enter="{ opacity: 1 }"
    :duration="800"
  >
    <div class="flex flex-col gap-2">
      <header class="navigation-group flex-nowrap justify-between border-b pb-2">
        <div class="navigation-group flex-shrink-0">
          <NuxtLink :to="`/admin/${project?.id}`">
            <Icon name="ph:arrow-left-bold" size="25" class="hover:scale-sm text-muted-foreground hover:text-accent md:mt-2" />
          </NuxtLink>
          <h2 class="max-w-lg truncate">
            {{ project?.name }}
          </h2>
        </div>

        <p class="line-clamp-2 max-w-lg text-xs leading-4 tracking-tight text-muted-foreground">
          {{ project?.description || "No description provided." }}
        </p>
      </header>

      <div class="flex flex-col gap-2">
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
