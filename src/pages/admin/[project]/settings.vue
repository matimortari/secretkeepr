<template>
  <div v-motion class="min-h-screen" :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <div class="flex flex-col gap-2">
      <header v-motion class="flex flex-row items-center gap-4 border-b pb-2" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
        <NuxtLink :to="`/admin/${project?.id}`">
          <Icon name="ph:arrow-left-bold" size="25" class="text-muted-foreground hover:text-accent md:mt-2" />
        </NuxtLink>
        <h2>
          {{ project?.name }}
        </h2>
        <p v-motion class="text-muted-foreground text-sm mt-2" :initial="{ opacity: 0, x: -10 }" :enter="{ opacity: 1, x: 0 }" :duration="800">
          {{ project?.description || "No description provided." }}
        </p>
      </header>

      <div v-motion class="flex flex-col gap-2" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
        <ProjectsProjectDetails :project="project" />
        <ProjectsProjectDangerZone :project="project" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"

const route = useRoute()
const projectId = route.params.project as string

const { projects } = storeToRefs(useProjectsStore())

const project = computed(() => {
  return projects.value.find(p => p.id === projectId) || null
})

watch(() => projectId, async (id) => {
  await useProjectsStore().getProjects()

  const projectName = useProjectsStore().projects?.find(p => p.id === id)
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
