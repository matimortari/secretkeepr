<template>
  <Dialog :is-open="isOpen" title="Import from .env" @update:is-open="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <textarea v-model="envContent" rows="10" class="scroll-area resize-none" placeholder="Paste your .env content here..." />

      <div class="flex flex-col items-start gap-1">
        <label class="text-sm font-semibold">Environment</label>
        <select v-model="selectedEnv" class="w-full capitalize">
          <option v-for="env in ['development', 'staging', 'production']" :key="env" :value="env" class="capitalize">
            {{ env }}
          </option>
        </select>
      </div>

      <footer class="flex flex-row items-center justify-between">
        <p class="text-caption text-danger-foreground">
          {{ secretStore.error || " " }}
        </p>

        <div class="navigation-group">
          <button class="font-semibold hover:underline" type="button" @click="emit('close')">
            Cancel
          </button>
          <button class="btn-success" type="submit">
            Import
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
  projectId: string
  existingSecrets: SecretType[]
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", secrets: SecretType[]): void
}>()

const secretStore = useSecretsStore()

const envContent = ref("")
const selectedEnv = ref<Environment>("development")

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
  secretStore.error = null
  const parsed = parseEnv(envContent.value)
  if (Object.entries(parsed).length === 0) {
    secretStore.error = "No valid key-value pairs found."
    return
  }

  const duplicateKeys: string[] = []
  for (const [key] of Object.entries(parsed)) {
    const existing = props.existingSecrets.find(secret => secret.key === key)
    const existsInEnv = existing?.values?.some(v => v.environment === selectedEnv.value)
    if (existsInEnv) {
      duplicateKeys.push(key)
    }
  }
  if (duplicateKeys.length > 0) {
    secretStore.error = `The following keys already exist: ${duplicateKeys.join(", ")}`
    return
  }

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

watch(() => props.isOpen, (open) => {
  if (open) {
    envContent.value = ""
    selectedEnv.value = "development"
    secretStore.error = null
  }
})
</script>
