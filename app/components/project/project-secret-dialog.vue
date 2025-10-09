<template>
  <Dialog :is-open="isOpen" :title="props.selectedSecret ? 'Edit Secret' : 'Create New Secret'" @update:is-open="emit('close')">
    <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
      <div class="flex flex-col items-start gap-1">
        <label for="key" class="text-sm font-semibold">Key</label>
        <input id="key" v-model="form.key" type="text" class="w-full">
        <span class="text-muted-foreground text-xs">
          The unique identifier for the secret.
        </span>
      </div>

      <div class="flex flex-col items-start gap-1">
        <label for="description" class="text-sm font-semibold">Description (optional)</label>
        <input id="description" v-model="form.description" type="text" class="w-full">
        <span class="text-muted-foreground text-xs">
          An optional description for the secret usage.
        </span>
      </div>

      <h5 class="border-t py-2">
        Environments
      </h5>

      <div v-for="env in environments" :key="env" class="flex flex-col items-start gap-1">
        <label :for="env" class="text-xs font-semibold capitalize">{{ env }}</label>
        <input :id="env" v-model="form.values[env]" type="text" class="w-full">
      </div>

      <footer class="flex flex-row items-center justify-between">
        <p class="text-warning">
          {{ projectStore.errors.createProjectSecret || projectStore.errors.updateProjectSecret || " " }}
        </p>

        <div class="navigation-group">
          <button class="text-sm font-semibold hover:underline" aria-label="Cancel" @click="emit('close')">
            Cancel
          </button>
          <button
            class="btn-success"
            type="submit"
            aria-label="Save Secret"
            :disabled="projectStore.loading.createProjectSecret || projectStore.loading.updateProjectSecret"
          >
            Save
          </button>
        </div>
      </footer>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  selectedSecret?: Secret | null
  projectId: string
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", payload: Secret): void
}>()

const environments: Environment[] = ["development", "staging", "production"]

const projectStore = useProjectStore()
const form = ref<{ key: string, description: string, values: Record<Environment, string> }>({
  key: "",
  description: "",
  values: {
    development: "",
    staging: "",
    production: "",
  },
})

async function handleSubmit() {
  projectStore.errors.createProjectSecret = null
  projectStore.errors.updateProjectSecret = null

  if (!form.value.key.trim()) {
    if (props.selectedSecret) {
      projectStore.errors.updateProjectSecret = "Secret key is required"
    }
    else {
      projectStore.errors.createProjectSecret = "Secret key is required"
    }
    return
  }

  const valuesArray: SecretValue[] = environments.map(env => ({
    environment: env,
    value: form.value.values[env].trim(),
    secretId: props.selectedSecret?.id || "",
  }))
    .filter(v => v.value.length > 0)

  if (!valuesArray.length) {
    if (props.selectedSecret) {
      projectStore.errors.updateProjectSecret = "At least one value is required"
    }
    else {
      projectStore.errors.createProjectSecret = "At least one value is required"
    }
    return
  }

  try {
    if (props.selectedSecret?.id) {
      const updateData = {
        key: form.value.key.trim(),
        description: form.value.description.trim(),
        values: valuesArray,
      }
      await projectStore.updateProjectSecret(props.projectId, props.selectedSecret.id, updateData)
    }
    else {
      const createData = {
        key: form.value.key.trim(),
        description: form.value.description.trim(),
        values: valuesArray,
      }
      await projectStore.createProjectSecret(props.projectId, createData)
    }

    emit("close")
  }
  catch (error) {
    console.error("Failed to save secret:", error)
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    if (props.selectedSecret) {
      const mappedValues: Record<Environment, string> = {
        development: "",
        staging: "",
        production: "",
      }

      props.selectedSecret.values?.forEach((sv) => {
        mappedValues[sv.environment] = sv.value
      })

      form.value = {
        key: props.selectedSecret.key,
        description: props.selectedSecret.description || "",
        values: mappedValues,
      }
    }
    else {
      form.value = {
        key: "",
        description: "",
        values: {
          development: "",
          staging: "",
          production: "",
        },
      }
    }
    projectStore.errors.createProjectSecret = null
    projectStore.errors.updateProjectSecret = null
  }
}, { immediate: true })
</script>
