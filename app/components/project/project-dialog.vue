<template>
  <Dialog :is-open="isOpen" title="Create New Project" @update:is-open="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="flex flex-col items-start gap-1">
        <label for="name" class="text-sm font-semibold">Project Name</label>
        <input id="name" v-model="form.name" type="text" class="w-full">
      </div>

      <div class="flex flex-col items-start gap-1">
        <label for="description" class="text-sm font-semibold">Description</label>
        <input id="description" v-model="form.description" type="text" class="w-full">
      </div>

      <footer class="flex flex-row items-center justify-between">
        <p class="text-caption text-danger-foreground">
          {{ projectsStore.error || " " }}
        </p>

        <nav class="navigation-group">
          <button class="font-semibold hover:underline" type="button" @click="emit('close')">
            Cancel
          </button>
          <button class="btn-success" type="submit">
            Save
          </button>
        </nav>
      </footer>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useProjectsStore } from "~/lib/stores/projects-store"

const props = defineProps<{
  isOpen: boolean
  selectedProject?: ProjectType
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", payload: ProjectType): void
}>()

const projectsStore = useProjectsStore()
const orgStore = useOrganizationStore()

const form = ref<{ name: string, description: string }>({
  name: "",
  description: "",
})

async function handleSubmit() {
  projectsStore.error = null
  if (!form.value.name.trim()) {
    projectsStore.error = "Project name is required"
    return
  }

  const payload: ProjectType = {
    name: form.value.name.trim(),
    description: form.value.description.trim(),
    orgId: orgStore.activeOrg?.id ?? "",

  }

  emit("save", payload)
  emit("close")
}

watch(() => props.isOpen, (open) => {
  if (open) {
    if (props.selectedProject) {
      form.value.name = props.selectedProject.name
      form.value.description = props.selectedProject.description || ""
    }
    else {
      form.value.name = ""
      form.value.description = ""
    }
    projectsStore.error = null
  }
}, { immediate: true })
</script>
