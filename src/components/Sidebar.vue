<template>
  <div>
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300" />

    <aside
      class="fixed md:static top-0 left-0 h-full md:h-auto min-h-screen w-64 md:w-52 bg-muted p-4 border-r rounded-br-xl transition-transform duration-300 z-40"
      :class="[
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <nav class="flex flex-col gap-4">
        <h6>
          Overview
        </h6>

        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          class="navigation-group text-sm text-muted-foreground font-semibold hover:scale-sm transition-all duration-500"
        >
          <Icon :name="link.icon" size="30" />
          <span>{{ link.label }}</span>
        </NuxtLink>

        <div class="navigation-group justify-between">
          <h6>
            Projects
          </h6>
          <Icon
            name="ph:plus-bold"
            size="25"
            role="button"
            class="hover:scale-md hover:text-accent transition-all duration-500"
            @click="openDialog()"
          />
        </div>

        <div class="flex flex-col gap-1 max-h-52 overflow-y-auto w-full scroll-area border-y">
          <NuxtLink
            v-for="project in projectsFromOrg"
            :key="project.id"
            :to="`/admin/${project.id}`"
            class="font-medium text-sm truncate w-full"
          >
            {{ project.name }}
          </NuxtLink>
        </div>

        <a href="https://github.com/matimortari/secretkeepr" class="navigation-group group">
          <Icon name="simple-icons:github" size="25" class="group-hover:scale-sm group-hover:text-accent transition-all duration-500" />
          <span class="font-semibold text-sm text-muted-foreground group-hover:underline">
            Support This Project
          </span>
        </a>
      </nav>
    </aside>
  </div>

  <ProjectsProjectDialog
    :is-open="isDialogOpen"
    @close="closeDialog"
    @save="handleCreateProject"
  />
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"

const props = defineProps<{
  organization: OrganizationType | null
  isOpen: boolean
}>()

const navLinks = [
  { href: "/admin/projects", icon: "ph:folder-open", label: "Projects" },
  { href: "/admin/organization", icon: "ph:building-office", label: "Organization" },
  { href: "/admin/preferences", icon: "ph:user-gear", label: "Preferences" },
]

const projectsStore = useProjectsStore()

const { projects } = storeToRefs(projectsStore)

const isDialogOpen = ref(false)

const projectsFromOrg = computed(() => {
  return projects.value.filter(project =>
    project.organizationId === props.organization?.id
    && typeof project.name === "string",
  )
})

function openDialog() {
  isDialogOpen.value = true
}

function closeDialog() {
  isDialogOpen.value = false
}

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
</script>
