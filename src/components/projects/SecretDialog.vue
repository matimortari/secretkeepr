<template>
  <Dialog :is-open="isOpen" :title="dialogTitle" @update:is-open="emit('close')">
    <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
      <div class="flex flex-col items-start gap-2">
        <label for="key" class="text-sm font-medium ">Key</label>
        <input
          id="key" v-model="form.key"
          type="text" class="w-full"
          required
        >

        <label for="description" class="text-sm font-medium">Description (optional)</label>
        <input
          id="description" v-model="form.description"
          type="text" class="w-full"
        >
      </div>

      <div v-for="env in environments" :key="env" class="flex flex-col items-start gap-1">
        <label :for="env" class="text-sm font-medium capitalize">{{ env }}</label>
        <input :id="env" v-model="form.values[env]" type="text" class="w-full">
      </div>

      <div v-if="hasErrors" class="flex flex-col gap-1 text-center max-w-sm">
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

type SecretFormValues = {
  [K in Environment]: string
}

const form = ref<{ key: string, description: string, values: SecretFormValues }>({
  key: "",
  description: "",
  values: {
    development: "",
    staging: "",
    production: "",
  },
})

const formErrors = ref<{ [key: string]: string }>({})
const hasErrors = computed(() => Object.keys(formErrors.value).length > 0)

const dialogTitle = computed(() =>
  props.selectedSecret ? "Edit Secret" : "Create New Secret",
)

watch(() => props.isOpen, (open) => {
  if (open) {
    if (props.selectedSecret) {
      const mappedValues: SecretFormValues = {
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
    formErrors.value = {}
  }
}, { immediate: true })

function handleSubmit() {
  formErrors.value = {}

  if (Object.keys(formErrors.value).length > 0)
    return
  if (!form.value.key.trim()) {
    formErrors.value.key = "Secret Key is required."
  }

  const valuesArray: SecretValueType[] = environments
    .map(env => ({
      environment: env,
      value: form.value.values[env].trim(),
    }))
    .filter(v => v.value.length > 0)
  if (valuesArray.length === 0) {
    formErrors.value.values = "At least one secret value is required."
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
</script>
