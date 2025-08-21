<template>
  <div v-if="isOpen" class="fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden" @click="$emit('update:isOpen', false)" />

  <aside
    class="fixed left-0 top-0 z-30 flex min-h-screen w-60 flex-col gap-2 rounded-br-xl border-b-2 border-r-2 bg-background p-4 transition-all md:static"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <span class="font-semibold">Overview</span>
    <nav class="flex flex-col gap-1 border-b py-2 text-sm font-semibold text-muted-foreground" aria-label="Main Navigation">
      <nuxt-link v-for="link in navLinks" :key="link.url" :to="link.url" class="navigation-group rounded p-2 hover:bg-muted">
        <icon :name="link.icon" size="30" />
        <span>{{ link.label }}</span>
      </nuxt-link>
    </nav>

    <div class="navigation-group justify-between">
      <span class="font-semibold">Projects</span>
      <button class="hover:scale-md transition-all hover:text-accent" aria-label="Create New Project" @click="isDialogOpen = true">
        <icon name="ph:plus-bold" size="25" />
      </button>
    </div>
    <nav v-if="projectsFromOrg.length" aria-label="Projects Navigation" class="scroll-area flex max-h-64 flex-col overflow-x-hidden">
      <nuxt-link v-for="project in projectsFromOrg" :key="project.id" :to="`/admin/${project.slug}`" class="text-info break-words p-2">
        {{ project.name }}
      </nuxt-link>
    </nav>

    <nuxt-link to="https://github.com/matimortari/secretkeepr" class="navigation-group group border-t py-4">
      <icon name="simple-icons:github" size="25" class="group-hover:scale-md transition-all group-hover:text-accent" />
      <span class="text-sm font-semibold text-muted-foreground">
        Support This Project
      </span>
    </nuxt-link>
  </aside>

  <ProjectDialog :is-open="isDialogOpen" @close="isDialogOpen = false" @save="handleCreateProject" />
</template>

<script setup lang="ts">
const props = defineProps<{
  org: OrganizationType | null
  isOpen: boolean
}>()

defineEmits(["update:isOpen"])

const navLinks = [
  { url: "/admin/projects", icon: "ph:folder-open", label: "Projects" },
  { url: "/admin/organization", icon: "ph:building-office", label: "Organization" },
  { url: "/admin/audit-logs", icon: "ph:clipboard-text", label: "Audit Logs" },
  { url: "/admin/preferences", icon: "ph:user-gear", label: "User Preferences" },
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
      slug: project.slug,
      description: project.description ?? undefined,
      orgId: project.orgId,
    })
    await projectsStore.getProjects()
    isDialogOpen.value = false
  }
  catch (error: any) {
    console.error("Failed to create project:", error)
    projectsStore.error = error.message
  }
}

watch(isDialogOpen, (val) => {
  if (val)
    projectsStore.error = null
})
</script>

<style scoped>
.scroll-area {
  direction: rtl;
}
.scroll-area > * {
  direction: ltr;
}
</style>
