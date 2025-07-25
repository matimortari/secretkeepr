<template>
  <Dialog :is-open="isOpen" :title="dialogTitle" @update:is-open="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="flex flex-col items-start gap-1">
        <label for="name" class="text-label">Project Name</label>
        <input
          id="name" v-model="form.name"
          type="text" class="w-full"
          required
        >
      </div>

      <div class="flex flex-col items-start gap-1">
        <label for="description" class="text-label">Description</label>
        <input id="description" v-model="form.description" type="text" class="w-full">
      </div>

      <p v-if="errorMsg" class="text-caption p-2 text-danger-foreground">
        {{ errorMsg }}
      </p>

      <footer class="navigation-group justify-end">
        <button class="font-semibold hover:underline" type="button" @click="emit('close')">
          Cancel
        </button>
        <button class="btn-success w-16" type="submit" :disabled="!!errorMsg">
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

const errorMsg = ref("")

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
    errorMsg.value = ""
  }
}, { immediate: true })

const dialogTitle = computed(() =>
  props.project ? "Edit Project" : "Create New Project",
)

async function handleSubmit() {
  errorMsg.value = ""
  if (!form.value.name.trim()) {
    errorMsg.value = "Project name is required"
  }

  const { selectedOrganization } = storeToRefs(userStore)
  if (!selectedOrganization.value?.id) {
    errorMsg.value = "Organization is required"
  }
  if (errorMsg.value) {
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
