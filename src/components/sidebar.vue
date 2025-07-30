<template>
  <div v-if="isOpen" class="fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden" @click="$emit('update:isOpen', false)" />

  <aside
    class="fixed left-0 top-0 z-30 flex min-h-screen w-60 flex-col gap-2 rounded-br-xl border-b-2 border-r-2 bg-background p-4 transition-all md:static"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <span class="font-semibold">Overview</span>
    <nav class="flex flex-col gap-1 border-b py-2 text-sm font-semibold text-muted-foreground">
      <NuxtLink v-for="link in navLinks" :key="link.href" :to="link.href" class="navigation-group rounded p-2 hover:bg-muted">
        <Icon :name="link.icon" size="30" />
        <span>{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div class="navigation-group justify-between">
      <span class="font-semibold">Projects</span>
      <Icon
        name="ph:plus-bold"
        size="25"
        role="button"
        class="hover:scale-md transition-all hover:text-accent"
        @click="isDialogOpen = true"
      />
    </div>
    <nav v-if="projectsFromOrg.length" class="scroll-area flex flex-col overflow-y-auto">
      <NuxtLink v-for="project in projectsFromOrg" :key="project.id" :to="`/admin/${project.id}`" class="text-caption truncate rounded p-2 hover:bg-muted">
        {{ project.name }}
      </NuxtLink>
    </nav>

    <a href="https://github.com/matimortari/secretkeepr" class="navigation-group group border-t py-4">
      <Icon name="simple-icons:github" size="25" class="group-hover:scale-md transition-all group-hover:text-accent" />
      <span class="text-sm font-semibold text-muted-foreground">
        Support This Project
      </span>
    </a>
  </aside>

  <ProjectDialog :is-open="isDialogOpen" @close="isDialogOpen = false" @save="handleCreateProject" />
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

const isDialogOpen = ref(false)

const projectsFromOrg = computed(() =>
  projectsStore.projects.filter(
    project => project.orgId === props.org?.id && typeof project.name === "string",
  ),
)

async function handleCreateProject(project: ProjectType) {
  try {
    await projectsStore.createProject({
      name: project.name,
      description: project.description ?? undefined,
      orgId: project.orgId,
    })
    await projectsStore.getProjects()
    isDialogOpen.value = false
  }
  catch (error: any) {
    console.error("Failed to create project:", error)
  }
}

watch(isDialogOpen, (val) => {
  if (val)
    projectsStore.error = null
})
</script>
