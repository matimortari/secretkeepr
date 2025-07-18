<template>
  <div class="flex flex-col gap-2 border-b">
    <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
      <h4>
        Project Details
      </h4>
      <p class="text-sm text-muted-foreground">
        Manage project details and settings.
      </p>
    </header>

    <form class="flex flex-col gap-2 p-2 md:w-1/2" @submit.prevent="handleSubmit">
      <label class="text-sm font-medium">Project Name</label>
      <input v-model="form.name" type="text" placeholder="Enter project name">

      <label class="text-sm font-medium">Project Description</label>
      <textarea v-model="form.description" placeholder="Enter project description" rows="3" class="resize-none scroll-area" />

      <label class="text-sm font-medium">Project ID</label>
      <input :value="form.id ?? ''" type="text" class="bg-muted cursor-not-allowed" readonly>

      <button class="btn-primary self-start" type="submit">
        <Icon name="ph:check-circle" size="20" />
        <span>Save Changes</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"

const props = defineProps<{
  project: ProjectType | null
}>()

const form = ref({
  name: props.project?.name || "",
  description: props.project?.description || "",
  id: props.project?.id || "",
})

watch(() => props.project, (newProject) => {
  form.value.name = newProject?.name || ""
  form.value.description = newProject?.description || ""
  form.value.id = newProject?.id || ""
})

async function handleSubmit() {
  if (!props.project)
    return

  await useProjectsStore().updateProject(props.project.id ?? "", {
    name: form.value.name,
    description: form.value.description,
  })
  await useProjectsStore().getProjects()
}
</script>
