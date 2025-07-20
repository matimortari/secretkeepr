<template>
  <Dialog :is-open="isOpen" :title="dialogTitle" @update:is-open="emit('close')">
    <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
      <div class="flex flex-col items-start gap-1">
        <label for="name" class="text-sm font-medium">Project Name</label>
        <input
          id="name" v-model="form.name"
          type="text" class="w-full"
          required
        >
      </div>

      <div class="flex flex-col items-start gap-1">
        <label for="description" class="text-sm font-medium">Description</label>
        <input id="description" v-model="form.description" type="text" class="w-full">
      </div>

      <div v-if="hasErrors" class="flex flex-col gap-2 text-center max-w-sm">
        <span v-for="(msg, key) in formErrors" :key="key" class="text-danger-foreground">
          {{ msg }}
        </span>
      </div>

      <footer class="navigation-group justify-end">
        <button class="hover:underline" type="button" @click="emit('close')">
          Cancel
        </button>
        <button class="btn-primary w-16" type="submit" :disabled="hasErrors">
          Save
        </button>
      </footer>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  isOpen: boolean
  selectedProject?: ProjectType
  project?: ProjectType
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", payload: ProjectType): void
}>()

const userStore = useUserStore()

const form = ref<{ name: string, description: string }>({
  name: "",
  description: "",
})

const formErrors = ref<{ [key: string]: string }>({})

const hasErrors = computed(() => Object.keys(formErrors.value).length > 0)

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
    formErrors.value = {}
  }
}, { immediate: true })

const dialogTitle = computed(() =>
  props.project ? "Edit Project" : "Create New Project",
)

async function handleSubmit() {
  formErrors.value = {}
  if (!form.value.name.trim()) {
    formErrors.value.name = "Project name is required"
  }

  const { selectedOrganization } = storeToRefs(userStore)
  if (!selectedOrganization.value?.id) {
    formErrors.value.organization = "Organization is required"
  }
  if (hasErrors.value) {
    return
  }

  const payload: ProjectType = {
    id: props.selectedProject?.id,
    name: form.value.name.trim(),
    description: form.value.description.trim(),
    organizationId: selectedOrganization.value?.id ?? "",
  }

  emit("save", payload)
  emit("close")
}
</script>
