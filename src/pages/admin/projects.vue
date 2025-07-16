<template>
  <div v-motion class="min-h-screen" :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <div class="flex flex-col gap-4">
      <header v-motion class="flex flex-row items-center gap-4 border-b pb-2" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
        <h2>
          My Projects
        </h2>
      </header>

      <div v-motion class="flex flex-row justify-between items-center gap-2" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
        <div class="relative w-full">
          <span class="absolute inset-y-0 left-0 flex flex-row items-center pl-4 text-muted-foreground">
            <Icon name="ph:magnifying-glass-bold" size="20" />
          </span>
          <input id="search" v-model="searchQuery" type="text" placeholder="Search by project name..." class="w-full pl-10">
        </div>

        <button class="btn-primary" @click="openDialog()">
          <span>Add New Project</span>
          <Icon name="ph:plus-bold" />
        </button>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center h-[80vh]">
        <Spinner />
      </div>
      <p v-if="!filteredProjects.length && !isLoading" class="text-muted-foreground text-center h-[80vh] my-8">
        No projects found. Create a new project to get started.
      </p>

      <ul v-else class="grid md:grid-cols-3 gap-4 max-h-[80vh] overflow-y-auto scroll-area">
        <li v-for="(project, index) in filteredProjects" :key="project.id" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" :duration="400" :delay="20 * Number(index)">
          <ProjectsProjectCard :project="project" />
        </li>
        <li v-motion :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }" :duration="400" :delay="20 * filteredProjects.length">
          <button
            class="h-[180px] w-full flex flex-col items-center justify-center gap-4 border-2 border-dashed card bg-transparent text-muted-foreground hover:text-accent hover:border-secondary transition-all duration-500 group"
            @click="openDialog()"
          >
            <Icon name="ph:plus" size="50" class="group-hover:scale-md group-hover:text-accent transition-all duration-500" />
            <span class="font-semibold group-hover:scale-sm group-hover:text-accent transition-all duration-500">Add New Project</span>
          </button>
        </li>
      </ul>

      <ProjectsProjectDialog
        :is-open="isDialogOpen"
        @close="closeDialog"
        @save="handleCreateProject"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"

const { projects, isLoading } = storeToRefs(useProjectsStore())

const organizationId = computed(() => useUserStore().selectedOrganization?.id || "")

const searchQuery = ref("")
const selectedProject = ref<ProjectType | null>(null)
const isDialogOpen = ref(false)

const filteredProjects = computed(() => {
  return projects.value.filter(project =>
    project.organizationId === organizationId.value
    && typeof project.name === "string"
    && project.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

function openDialog(project?: ProjectType) {
  selectedProject.value = project || null
  isDialogOpen.value = true
}

function closeDialog() {
  isDialogOpen.value = false
  selectedProject.value = null
}

onMounted(async () => {
  await useProjectsStore().getProjects()
})

async function handleCreateProject(project: ProjectType) {
  try {
    await useProjectsStore().createProject({
      name: project.name,
      description: project.description ?? null,
      organizationId: project.organizationId,
    })
    await useProjectsStore().getProjects()
    closeDialog()
  }
  catch (error) {
    console.error("Failed to create project:", error)
  }
}

useHead({
  title: "Projects – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/admin/projects" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Projects – SecretKeepR",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
})

definePageMeta({
  layout: "admin",
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: "/sign-in",
  },
})
</script>
