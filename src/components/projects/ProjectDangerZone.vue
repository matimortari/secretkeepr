<template>
  <div class="flex flex-col gap-2 border-b">
    <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
      <h4>
        Danger Zone
      </h4>
      <p class="text-sm text-muted-foreground">
        Manage critical actions related to the project.
      </p>
    </header>
    <hr>

    <section class="flex flex-col md:flex-row md:items-center md:justify-between px-2 pb-2">
      <header class="flex flex-col gap-1 items-center text-center md:items-start md:text-start">
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

async function handleDeleteProject() {
  // eslint-disable-next-line no-alert
  if (!confirm("Are you sure you want to delete this project?"))
    return

  try {
    if (!props.project?.id) {
      console.error("Project ID is undefined.")
      return
    }

    await useProjectsStore().deleteProject(props.project.id)
    router.push("/admin/projects")
  }
  catch (error) {
    console.error("Failed to delete project:", error)
  }
}
</script>
