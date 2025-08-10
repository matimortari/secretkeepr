<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <header class="navigation-group border-b pb-2">
      <h2>
        My Projects
      </h2>

      <nav class="navigation-group w-full flex-1 justify-end">
        <div class="relative hidden md:block">
          <span class="absolute inset-y-0 left-0 flex flex-row items-center pl-4 text-muted-foreground">
            <icon name="ph:magnifying-glass-bold" size="20" />
          </span>
          <input
            id="search" v-model="searchQuery"
            type="text" placeholder="Search projects..."
            class="w-full pl-10"
          >
        </div>

        <button class="btn-primary" aria-label="Add New Project" @click="isDialogOpen = true">
          <span class="hidden md:inline">Add New Project</span>
          <icon name="ph:plus-bold" size="20" />
        </button>
      </nav>
    </header>

    <p v-if="!filteredProjects.length" class="text-info my-8 h-[80vh] text-center">
      No projects found. Create a new project to get started.
    </p>

    <ul v-else class="scroll-area grid max-h-[80vh] gap-4 overflow-y-auto md:grid-cols-3">
      <li
        v-for="(project, index) in filteredProjects" :key="project.id"
        v-motion :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }" :duration="400"
        :delay="50 * index"
      >
        <ProjectCard :project="project" />
      </li>
      <li
        v-motion :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0 }" :duration="400"
        :delay="50 * filteredProjects.length"
      >
        <button
          class="card group flex h-[180px] w-full flex-col items-center justify-center gap-4 border-2 border-dashed bg-transparent text-muted-foreground transition-all hover:border-secondary hover:text-secondary"
          aria-label="Add New Project" @click="isDialogOpen = true"
        >
          <icon name="ph:plus" size="50" class="group-hover:scale-md transition-all group-hover:text-secondary" />
          <span class="group-hover:scale-sm font-semibold transition-all group-hover:text-secondary">Add New Project</span>
        </button>
      </li>
    </ul>

    <ProjectDialog :is-open="isDialogOpen" @close="isDialogOpen = false" @save="handleCreateProject" />
  </div>
</template>

<script setup lang="ts">
import auth from "~/lib/middleware/auth"
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useProjectsStore } from "~/lib/stores/projects-store"

const orgStore = useOrganizationStore()
const projectsStore = useProjectsStore()

const searchQuery = ref("")
const isDialogOpen = ref(false)

const filteredProjects = computed(() => {
  return projectsStore.projects.filter(project =>
    typeof project.name === "string"
    && project.orgId === orgStore.activeOrg?.id
    && project.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

async function handleCreateProject(project: ProjectType) {
  try {
    await projectsStore.createProject({
      name: project.name,
      slug: project.slug,
      description: project.description ?? undefined,
      orgId: project.orgId,
    })
    await projectsStore.getProjects()
    isDialogOpen.value = false
  }
  catch (error: any) {
    console.error("Failed to create project:", error)
    projectsStore.error = error?.message
  }
}

onMounted(async () => {
  await projectsStore.getProjects()
})

useHead({
  title: "Projects - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/admin/projects" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Projects - SecretKeepR",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
})

definePageMeta({
  layout: "admin",
  middleware: auth,
})
</script>
