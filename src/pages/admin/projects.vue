<template>
  <div
    v-motion :initial="{ opacity: 0 }"
    :enter="{ opacity: 1 }" :transition="{ duration: 800 }"
    class="flex flex-col gap-4"
  >
    <header class="navigation-group border-b pb-2">
      <h2>
        My Projects
      </h2>

      <nav class="navigation-group w-full flex-1 justify-end">
        <div class="relative hidden md:block">
          <span class="absolute inset-y-0 left-0 flex flex-row items-center pl-4 text-muted-foreground">
            <Icon name="ph:magnifying-glass-bold" size="20" />
          </span>
          <input
            id="search" v-model="searchQuery"
            type="text" placeholder="Search projects..."
            class="w-full pl-10"
          >
        </div>

        <button class="btn-primary" @click="openDialog()">
          <span class="hidden md:inline">Add New Project</span>
          <Icon name="ph:plus-bold" size="20" />
        </button>
      </nav>
    </header>

    <p v-if="!filteredProjects.length" class="my-8 h-[80vh] text-center text-muted-foreground">
      No projects found. Create a new project to get started.
    </p>

    <ul v-else class="scroll-area grid max-h-[80vh] gap-4 overflow-y-auto md:grid-cols-3">
      <li
        v-for="(project, index) in filteredProjects" :key="project.id"
        v-motion :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }" :transition="{ duration: 400 }"
        :delay="20 * Number(index)"
      >
        <ProjectsProjectCard :project="project" />
      </li>
      <li
        v-motion :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0 }" :transition="{ duration: 400 }"

        :delay="20 * filteredProjects.length"
      >
        <button
          class="card group flex h-[180px] w-full flex-col items-center justify-center gap-4 border-2 border-dashed bg-transparent text-muted-foreground transition-all hover:border-secondary hover:text-secondary"
          @click="openDialog()"
        >
          <Icon name="ph:plus" size="50" class="group-hover:scale-md transition-all group-hover:text-secondary" />
          <span class="group-hover:scale-sm font-semibold transition-all group-hover:text-secondary">Add New Project</span>
        </button>
      </li>
    </ul>

    <ProjectsProjectDialog
      :is-open="isDialogOpen"
      @close="closeDialog"
      @save="handleCreateProject"
    />
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"

const userStore = useUserStore()
const projectsStore = useProjectsStore()

const { projects } = storeToRefs(projectsStore)
const selectedProject = ref<ProjectType | null>(null)
const searchQuery = ref("")
const isDialogOpen = ref(false)

const organizationId = computed(() => userStore.selectedOrganization?.id || "")

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
  await projectsStore.getProjects()
})

async function handleCreateProject(project: ProjectType) {
  try {
    await projectsStore.createProject({
      name: project.name,
      description: project.description ?? undefined,
      organizationId: project.organizationId,
    })
    await projectsStore.getProjects()
    closeDialog()
  }
  catch (error: any) {
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
