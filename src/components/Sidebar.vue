<template>
  <aside v-motion class="w-52 bg-muted p-4 border-r rounded-br-xl hidden md:block" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
    <nav class="md:items-start md:justify-start md:flex-col md:flex gap-4">
      <header class="uppercase flex flex-row items-center gap-2">
        <h5>
          Overview
        </h5>
      </header>

      <NuxtLink
        v-for="link in navLinks" :key="link.href" :to="link.href"
        class="flex flex-row items-center gap-4 text-foreground text-sm hover:scale-sm hover:text-muted-foreground transition-all"
      >
        <Icon :name="link.icon" size="30" />
        <span class="text-muted-foreground font-semibold">{{ link.label }}</span>
      </NuxtLink>

      <header class="uppercase flex flex-row items-center gap-2">
        <h5>
          Projects
        </h5>
        <Icon name="ph:plus-bold" size="25" role="button" class="cursor-pointer hover:scale-sm hover:text-primary transition-all" @click="openDialog()" />
      </header>

      <p v-if="isLoading" class="text-muted-foreground text-center">
        Loading projects...
      </p>

      <div v-else class="flex flex-col gap-2 max-h-52 overflow-y-auto w-full scroll-area">
        <NuxtLink
          v-for="project in projectsFromOrg" :key="project.id" :to="`/admin/${project.id}`"
          class="flex text-foreground text-sm hover:text-muted-foreground hover:underline transition-all"
        >
          <span>{{ project.name }}</span>
        </NuxtLink>
      </div>

      <a href="https://github.com/matimortari/secretkeepr" class="flex flex-row items-center gap-4 group">
        <Icon name="simple-icons:github" size="25" class="group-hover:scale-sm group-hover:text-accent transition-all" />
        <span class="text-sm text-muted-foreground group-hover:underline">Support This Project</span>
      </a>
    </nav>
  </aside>

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
}>()

const { projects, isLoading } = storeToRefs(useProjectsStore())

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

const navLinks = [
  { href: "/admin/projects", icon: "ph:folder-open", label: "Projects" },
  { href: "/admin/organization", icon: "ph:building-office", label: "Organization" },
  { href: "/admin/preferences", icon: "ph:user-gear", label: "Preferences" },
]
</script>
