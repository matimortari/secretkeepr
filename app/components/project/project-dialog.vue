<template>
  <Dialog :is-open="isOpen" title="Create New Project" @update:is-open="emit('close')">
    <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
      <div class="flex flex-col items-start gap-1">
        <label for="name" class="text-sm font-semibold">Project Name</label>
        <input id="name" v-model="form.name" type="text" class="w-full">
      </div>

      <div class="flex flex-col items-start gap-1">
        <label for="slug" class="text-sm font-semibold">Project Slug</label>
        <input
          id="slug"
          v-model="form.slug"
          type="text"
          class="w-full"
          :placeholder="form.name.trim().toLowerCase().replace(/\s+/g, '-')"
        >
        <span class="text-muted-foreground text-xs">
          This will be used in the project URL.
        </span>
      </div>

      <div class="flex flex-col items-start gap-1">
        <label for="description" class="text-sm font-semibold">Description</label>
        <input id="description" v-model="form.description" type="text" class="w-full">
        <span class="text-muted-foreground text-xs">
          An optional description for your project.
        </span>
      </div>

      <footer class="flex flex-row items-center justify-between">
        <p class="text-warning">
          {{ projectsStore.error || " " }}
        </p>

        <nav class="navigation-group">
          <button class="text-sm font-semibold hover:underline" aria-label="Cancel" @click="emit('close')">
            Cancel
          </button>
          <button class="btn-success" type="submit" aria-label="Save Project">
            Save
          </button>
        </nav>
      </footer>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
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

const form = ref<{ name: string, slug: string, description: string }>({
  name: "",
  slug: "",
  description: "",
})

async function handleSubmit() {
  projectsStore.error = null
  if (!form.value.name.trim()) {
    projectsStore.error = "Project name is required"
    return
  }

  const payload: ProjectType = {
    id: props.selectedProject?.id ?? "",
    name: form.value.name.trim(),
    slug: form.value.slug.trim() || form.value.name.trim().toLowerCase().replace(/\s+/g, "-"),
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
      form.value.slug = props.selectedProject.slug || ""
      form.value.description = props.selectedProject.description || ""
    }
    else {
      form.value.name = ""
      form.value.slug = ""
      form.value.description = ""
    }
    projectsStore.error = null
  }
}, { immediate: true })
</script>
