<template>
  <div>
    <div
      v-if="isOpen"
      class="fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden"
      @click="$emit('update:isOpen', false)"
    />
    <aside
      class="fixed left-0 top-0 z-40 h-full min-h-screen w-64 rounded-br-xl border-r bg-muted p-4 transition-transform duration-300 md:static md:h-auto md:w-52"
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
          class="navigation-group hover:scale-sm text-sm font-semibold text-muted-foreground transition-all duration-500"
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
            class="hover:scale-md transition-all duration-500 hover:text-accent"
            @click="openDialog()"
          />
        </div>

        <div class="scroll-area flex max-h-52 w-full flex-col gap-1 overflow-y-auto border-y">
          <NuxtLink
            v-for="project in projectsFromOrg"
            :key="project.id"
            :to="`/admin/${project.id}`"
            class="w-full truncate text-sm font-medium"
          >
            {{ project.name }}
          </NuxtLink>
        </div>

        <a href="https://github.com/matimortari/secretkeepr" class="navigation-group group">
          <Icon name="simple-icons:github" size="25" class="group-hover:scale-sm transition-all duration-500 group-hover:text-accent" />
          <span class="text-sm font-semibold text-muted-foreground group-hover:underline">
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

defineEmits<{
  (e: "update:isOpen", value: boolean): void
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
