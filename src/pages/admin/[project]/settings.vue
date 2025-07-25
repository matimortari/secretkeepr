<template>
  <div
    v-motion :initial="{ opacity: 0 }"
    :enter="{ opacity: 1 }" :transition="{ duration: 800 }"
    class="flex flex-col gap-4"
  >
    <header class="navigation-group border-b pb-2">
      <NuxtLink :to="`/admin/${project?.id}`">
        <Icon name="ph:arrow-left-bold" size="25" class="hover:scale-sm text-muted-foreground hover:text-accent md:mt-2" />
      </NuxtLink>
      <h2 class="max-w-lg truncate">
        {{ project?.name }}
      </h2>
    </header>

    <div class="flex flex-col gap-8">
      <ProjectsProjectDetails :project="project" />
      <ProjectsProjectDangerZone v-if="currentUserId === projectOwnerId" :project="project" />
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
