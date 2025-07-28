<template>
  <Dialog :is-open="isOpen" :title="props.selectedSecret ? 'Edit Secret' : 'Create New Secret'" @update:is-open="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="flex flex-col items-start gap-2">
        <label for="key" class="text-label">Key</label>
        <input id="key" v-model="form.key" type="text" class="w-full">

        <label for="description" class="text-label">Description (optional)</label>
        <input id="description" v-model="form.description" type="text" class="w-full">
      </div>

      <div v-for="env in environments" :key="env" class="flex flex-col items-start gap-1">
        <label :for="env" class="text-label capitalize">{{ env }}</label>
        <input :id="env" v-model="form.values[env]" type="text" class="w-full">
      </div>

      <footer class="flex flex-row items-center justify-between">
        <p class="text-caption text-danger-foreground">
          {{ secretStore.error || " " }}
        </p>

        <div class="navigation-group">
          <button class="font-semibold hover:underline" type="button" @click="emit('close')">
            Cancel
          </button>
          <button class="btn-success" type="submit" :disabled="!!secretStore.error">
            Save
          </button>
        </div>
      </footer>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { useSecretsStore } from "~/lib/stores/secrets-store"

const props = defineProps<{
  isOpen: boolean
  selectedSecret?: SecretType | null
  projectId: string
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", payload: SecretType): void
}>()

const environments: Environment[] = ["development", "staging", "production"]

const secretStore = useSecretsStore()
const form = ref<{ key: string, description: string, values: Record<Environment, string> }>({
  key: "",
  description: "",
  values: {
    development: "",
    staging: "",
    production: "",
  },
})

function handleSubmit() {
  secretStore.error = null
  if (!form.value.key.trim()) {
    secretStore.error = "Secret key is required"
    return
  }

  const valuesArray: SecretValueType[] = environments.map(env => ({
    environment: env,
    value: form.value.values[env].trim(),
  }))
    .filter(v => v.value.length > 0)
  if (valuesArray.length === 0) {
    secretStore.error = "At least one value is required"
    return
  }

  const payload: SecretType = {
    key: form.value.key.trim(),
    description: form.value.description.trim(),
    values: valuesArray,
    ...(props.selectedSecret?.id ? { id: props.selectedSecret.id } : {}),
  }

  emit("save", payload)
  emit("close")
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
    secretStore.error = null
  }
}, { immediate: true })
</script>
