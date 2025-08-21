<template>
  <div class="scroll-area overflow-x-auto">
    <table class="table-fixed rounded-sm md:w-full md:overflow-hidden">
      <thead>
        <tr class="bg-muted text-sm font-semibold">
          <th class="navigation-group w-full p-2 text-left">
            <span>Key</span>
            <icon
              name="ph:arrow-down-bold" size="15"
              aria-label="Sort by Key" role="button"
              class="transition-all hover:text-primary" title="Sort by Key"
              :class="sort.direction === 'asc' ? 'rotate-180' : 'rotate-0'" @click="sort.direction = sort.direction === 'asc' ? 'desc' : 'asc'"
            />
          </th>

          <th v-for="env in environments" :key="env" class="p-2 text-left capitalize md:w-1/6">
            <span>{{ env }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(secret, index) in sortedSecrets" :key="secret.key"
          v-motion
          :initial="{ opacity: 0 }" :enter="{ opacity: 1 }"
          :duration="400" :delay="100 * index"
        >
          <td class="flex flex-row items-center justify-between gap-4 p-2 font-mono text-sm font-semibold text-muted-foreground">
            <span class="w-full truncate">{{ secret.key }}</span>
            <icon
              v-if="secret.description"
              name="carbon:information-square"
              :title="secret.description ?? undefined"
              size="15"
              class="hover:scale-md hidden flex-shrink-0 cursor-pointer transition-all md:inline"
            />

            <nav class="flex items-center justify-end gap-2 md:justify-start">
              <button aria-label="Toggle Secret Value Visibility" @click="visibleKeys[secret.key] = !visibleKeys[secret.key]">
                <icon :name="visibleKeys[secret.key] ? 'carbon:view' : 'carbon:view-off'" size="20" class="hover:scale-md transition-all hover:text-accent" />
              </button>
              <button aria-label="Edit Secret" @click="handleUpdateSecret(secret.key)">
                <icon name="carbon:edit" size="20" class="hover:scale-md transition-all hover:text-accent" />
              </button>
              <button aria-label="Delete Secret" @click="handleDeleteSecret(secret.key)">
                <icon name="carbon:delete" size="20" class="hover:scale-md transition-all hover:text-danger-foreground" />
              </button>
            </nav>
          </td>

          <td v-for="env in environments" :key="env" class="w-[150px] max-w-[150px] overflow-hidden p-2 font-mono text-sm text-muted-foreground">
            <div class="flex flex-row items-center justify-between gap-4">
              <span
                class="max-w-[80%] select-none truncate"
                :class="[
                  getSecretValue(secret.key, env) ? 'cursor-pointer rounded bg-card px-1 transition-all hover:text-primary' : '',
                ]" @click="copyToClipboard(getSecretValue(secret.key, env))"
              >
                {{ renderValue(secret.key, env) }}
              </span>

              <button aria-label="Copy Secret Value" @click="copyToClipboard(getSecretValue(secret.key, env))">
                <icon name="carbon:copy" size="20" class="hover:scale-md transition-all hover:text-accent" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  secrets: SecretType[]
  projectId: string
}>()

const emit = defineEmits(["edit", "deleted", "update"])

const secretsStore = useSecretsStore()

const visibleKeys = ref<Record<string, boolean>>({})
const environments = ref(["development", "staging", "production"])
const sort = ref<{ key: string, direction: "asc" | "desc" }>({
  key: "key",
  direction: "asc",
})

const sortedSecrets = computed(() => {
  return [...props.secrets].sort((a, b) => {
    if (sort.value.direction === "asc")
      return a.key.localeCompare(b.key)
    else return b.key.localeCompare(a.key)
  })
})

function getSecretValue(key: string, env: string) {
  const secretsWithKey = props.secrets.filter(s => s.key === key)
  for (const secret of secretsWithKey) {
    const val = secret.values?.find(v => v.environment === env)
    if (val?.value)
      return val.value
  }
  return ""
}

function renderValue(key: string, env: string): string {
  const secretValue = getSecretValue(key, env)
  if (!secretValue)
    return "—"

  return visibleKeys.value[key] ? secretValue : "•".repeat(Math.min(secretValue.length))
}

function handleUpdateSecret(key: string) {
  const secret = props.secrets.find(s => s.key === key)
  if (secret)
    emit("edit", secret)
}

async function handleDeleteSecret(key: string) {
  try {
    const secret = props.secrets.find(s => s.key === key)
    if (secret?.id) {
      await secretsStore.deleteSecret(props.projectId, secret.id)
      emit("deleted", key)
    }
  }
  catch (error: any) {
    console.error("Failed to delete secret:", error)
    secretsStore.error = error.message
  }
}
</script>
