<template>
  <Dialog :is-open="isOpen" title="Import from .env" @update:is-open="emit('close')">
    <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
      <textarea v-model="envText" rows="10" class="resize-none font-mono scroll-area" placeholder="Paste your .env content here..." />

      <div class="flex flex-col items-start gap-1">
        <label class="text-sm font-medium">Environment</label>
        <select v-model="selectedEnv" class="w-full capitalize">
          <option v-for="env in environments" :key="env" :value="env" class="capitalize">
            {{ env }}
          </option>
        </select>
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
        <button class="btn-primary" type="submit" :disabled="hasErrors">
          Import Secrets
        </button>
      </footer>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  projectId: string
  existingSecrets: SecretType[]
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", secrets: SecretType[]): void
}>()

const environments: Environment[] = ["development", "staging", "production"]
const selectedEnv = ref<Environment>("development")
const envText = ref("")

const formErrors = ref<{ [key: string]: string }>({})
const hasErrors = computed(() => Object.keys(formErrors.value).length > 0)

watch(() => props.isOpen, (open) => {
  if (open) {
    envText.value = ""
    selectedEnv.value = "development"
    formErrors.value = {}
  }
})

function parseEnv(text: string): Record<string, string> {
  const lines = text.split("\n")
  const parsed: Record<string, string> = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#"))
      continue

    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (!match)
      continue

    const [, key, value] = match
    parsed[key.trim()] = value.trim().replace(/^"|"$/g, "")
  }

  return parsed
}

function handleSubmit() {
  formErrors.value = {}

  const parsed = parseEnv(envText.value)
  if (Object.entries(parsed).length === 0) {
    formErrors.value.key = "No valid secrets found in the provided content."
    return
  }

  const duplicateKeys: string[] = []

  // Check for conflicts in the selected environment
  for (const [key] of Object.entries(parsed)) {
    const existing = props.existingSecrets.find(secret => secret.key === key)
    const existsInEnv = existing?.values?.some(v => v.environment === selectedEnv.value)

    if (existsInEnv) {
      duplicateKeys.push(key)
    }
  }

  if (duplicateKeys.length > 0) {
    formErrors.value.key = `The following keys already exist in ${selectedEnv.value}: ${duplicateKeys.join(", ")}. Please remove them before importing.`
    return
  }

  // Construct payload only if no duplicate in selected environment
  const payload: SecretType[] = Object.entries(parsed).map(([key, value]) => {
    const secretId = crypto.randomUUID()
    return {
      id: secretId,
      key,
      projectId: props.projectId,
      values: [
        {
          id: crypto.randomUUID(),
          secretId,
          environment: selectedEnv.value,
          value,
        },
      ],
    }
  })

  emit("save", payload)
  emit("close")
}
</script>
