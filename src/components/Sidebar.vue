<template>
  <div v-if="isOpen" class="fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden" @click="$emit('update:isOpen', false)" />

  <aside
    class="fixed left-0 top-0 z-30 flex min-h-screen w-60 flex-col gap-2 rounded-br-xl bg-popover p-4 transition-all md:static"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <span class="text-label">Overview</span>
    <nav class="flex flex-col gap-2 border-b py-4 text-sm font-semibold text-muted-foreground">
      <NuxtLink v-for="link in navLinks" :key="link.href" :to="link.href" class="navigation-group hover:underline">
        <Icon :name="link.icon" size="30" />
        <span>{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div class="navigation-group justify-between">
      <span class="text-label">Projects</span>
      <Icon
        name="ph:plus-bold"
        size="25"
        role="button"
        class="transition-all hover:scale-105 hover:text-accent"
        @click="toggleDialog(true)"
      />
    </div>
    <nav v-if="projectsFromOrg.length" class="scroll-area flex flex-col gap-2 overflow-y-auto border-b py-4 text-sm font-semibold text-muted-foreground">
      <NuxtLink v-for="project in projectsFromOrg" :key="project.id" :to="`/admin/${project.id}`" class="truncate text-sm font-medium text-muted-foreground hover:underline">
        - {{ project.name }}
      </NuxtLink>
    </nav>

    <a href="https://github.com/matimortari/secretkeepr" class="navigation-group group">
      <Icon name="simple-icons:github" size="25" class="group-hover:scale-sm group-hover:text-accent" />
      <span class="text-sm font-semibold text-muted-foreground group-hover:underline">
        Support This Project
      </span>
    </a>
  </aside>

  <ProjectsProjectDialog
    :is-open="isDialogOpen"
    @close="toggleDialog(false)"
    @save="handleCreateProject"
  />
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"

const props = defineProps<{
  org: OrganizationType | null
  isOpen: boolean
}>()

defineEmits(["update:isOpen"])

const navLinks = [
  { href: "/admin/projects", icon: "ph:folder-open", label: "Projects" },
  { href: "/admin/organization", icon: "ph:building-office", label: "Organization" },
  { href: "/admin/preferences", icon: "ph:user-gear", label: "Preferences" },
]

const projectsStore = useProjectsStore()

const { projects } = storeToRefs(projectsStore)
const isDialogOpen = ref(false)

const projectsFromOrg = computed(() =>
  projects.value.filter(
    project => project.orgId === props.org?.id && typeof project.name === "string",
  ),
)

function toggleDialog(open?: boolean) {
  isDialogOpen.value = open ?? !isDialogOpen.value
}

async function handleCreateProject(project: ProjectType) {
  try {
    await projectsStore.createProject({
      name: project.name,
      description: project.description ?? undefined,
      orgId: project.orgId,
    })
    await projectsStore.getProjects()
    toggleDialog(false)
  }
  catch (error: any) {
    console.error("Failed to create project:", error)
  }
}
</script>
