<template>
  <Dialog :is-open="isOpen" title="Import from .env" @update:is-open="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <textarea v-model="envText" rows="10" class="scroll-area resize-none font-mono" placeholder="Paste your .env content here..." />

      <div class="flex flex-col items-start gap-1">
        <label class="text-label">Environment</label>
        <select v-model="selectedEnv" class="w-full capitalize">
          <option v-for="env in environments" :key="env" :value="env" class="capitalize">
            {{ env }}
          </option>
        </select>
      </div>

      <p v-if="errorMsg" class="text-caption p-2 text-danger-foreground">
        {{ errorMsg }}
      </p>

      <footer class="navigation-group justify-end">
        <button class="font-semibold hover:underline" type="button" @click="emit('close')">
          Cancel
        </button>
        <button class="btn-success" type="submit" :disabled="!!errorMsg">
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

const errorMsg = ref("")

watch(() => props.isOpen, (open) => {
  if (open) {
    envText.value = ""
    selectedEnv.value = "development"
    errorMsg.value = ""
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
  errorMsg.value = ""

  const parsed = parseEnv(envText.value)
  if (Object.entries(parsed).length === 0) {
    errorMsg.value = "No valid secrets found in the provided content."
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
    errorMsg.value = `The following keys already exist in ${selectedEnv.value}: ${duplicateKeys.join(", ")}.`
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
