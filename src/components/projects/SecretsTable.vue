<template>
  <div class="scroll-area overflow-x-auto">
    <table class="w-full table-auto overflow-hidden rounded-sm border md:table-fixed">
      <thead>
        <tr class="border bg-muted text-sm font-semibold transition-all">
          <th class="navigation-group w-full select-none p-2 text-left">
            <span>Key</span>
            <Icon
              name="ph:arrow-down-bold"
              size="15"
              class="hover:scale-sm transition-all hover:text-primary"
              :class="sort.direction === 'asc' ? 'rotate-180' : 'rotate-0'"
              role="button"
              @click="toggleSort"
            />
          </th>
          <th v-for="env in environments" :key="env" class="border p-2 text-left capitalize md:w-1/6">
            <span>{{ env }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(secret, index) in sortedSecrets" :key="secret.key"
          v-motion class="border"
          :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
          :duration="600" :delay="100 * index"
        >
          <td class="relative flex flex-row items-center justify-between p-2 font-mono text-sm font-bold text-muted-foreground">
            <div class="flex max-w-[80%] flex-row items-center gap-2">
              <span class="truncate">{{ secret.key }}</span>
              <Icon
                v-if="secret.description" name="carbon:information-square"
                :title="secret.description ?? undefined" size="15"
                class="hover:scale-md hidden flex-shrink-0 cursor-pointer transition-all md:inline"
              />
            </div>
            <span class="navigation-group">
              <button @click="toggleVisibility(secret.key)">
                <Icon :name="visibleKeys[secret.key] ? 'carbon:view' : 'carbon:view-off'" size="20" class="hover:scale-md transition-all hover:text-accent" />
              </button>
              <button @click="updateSecret(secret.key)">
                <Icon name="carbon:edit" size="20" class="hover:scale-md transition-all hover:text-accent" />
              </button>
              <button @click="handleDeleteSecret(secret.key)">
                <Icon name="carbon:delete" size="20" class="hover:scale-md transition-all hover:text-danger" />
              </button>
            </span>
          </td>

          <td v-for="env in environments" :key="env" class="border p-2 font-mono text-sm text-muted-foreground">
            <div class="flex flex-row items-center justify-between">
              <span
                class="max-w-[80%] select-none truncate"
                :class="[
                  !getSecretValue(secret.key, env) ? '' : 'cursor-pointer rounded bg-card px-1 transition-all hover:text-primary',
                ]" @click="copyToClipboard(getSecretValue(secret.key, env))"
              >
                {{ renderValue(secret.key, env) }}
              </span>

              <button @click="copyToClipboard(getSecretValue(secret.key, env))">
                <Icon name="carbon:copy" size="20" class="hover:scale-md transition-all hover:text-accent" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useSecretsStore } from "~/lib/stores/secrets-store"

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

function toggleSort() {
  sort.value.direction = sort.value.direction === "asc" ? "desc" : "asc"
}

function toggleVisibility(key: string) {
  visibleKeys.value[key] = !visibleKeys.value[key]
}

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
  const val = getSecretValue(key, env)
  if (!val)
    return "—"

  return visibleKeys.value[key] ? val : "•".repeat(Math.min(val.length, 12))
}

function copyToClipboard(val: string) {
  if (val)
    navigator.clipboard.writeText(val)
}

function updateSecret(key: string) {
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
  }
}
</script>
