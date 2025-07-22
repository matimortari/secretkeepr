<template>
  <div class="flex flex-col">
    <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
      <h4>
        Danger Zone
      </h4>
      <p class="text-sm text-muted-foreground">
        Manage critical actions related to the project.
      </p>
    </header>

    <section class="md:navigation-group flex flex-col gap-2 border-b p-2 md:justify-between">
      <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
        <h5>
          Delete Project
        </h5>
        <p class="text-sm text-danger">
          This action is irreversible. All data associated with this project will be lost.
        </p>
      </header>

      <button class="btn-danger" @click="handleDeleteProject">
        <Icon name="ph:folder-simple-minus-bold" size="20" />
        <span>Delete Project</span>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"

const props = defineProps<{
  project: ProjectType | null
}>()

const router = useRouter()

const projectsStore = useProjectsStore()

async function handleDeleteProject() {
  if (!confirm("Are you sure you want to delete this project?"))
    return

  try {
    if (!props.project?.id) {
      console.error("Project ID is undefined.")
      return
    }

    await projectsStore.deleteProject(props.project.id)
    router.push("/admin/projects")
  }
  catch (error: any) {
    console.error("Failed to delete project:", error)
  }
}
</script>
