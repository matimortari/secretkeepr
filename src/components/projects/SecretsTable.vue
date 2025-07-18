<template>
  <div class="overflow-x-auto scroll-area">
    <table class="table-auto md:table-fixed w-full border rounded-sm overflow-hidden">
      <thead>
        <tr class="bg-muted font-semibold text-sm border transition-all duration-500">
          <th class="flex flex-row items-center gap-2 w-full p-2 text-left select-none">
            <span>Key</span>
            <Icon
              name="ph:arrow-down-bold"
              size="15"
              class="hover:scale-sm hover:text-primary transition-all duration-500"
              :class="sort.direction === 'asc' ? 'rotate-180' : 'rotate-0'"
              role="button"
              @click="toggleSort"
            />
          </th>
          <th v-for="env in environments" :key="env" class="w-40 p-2 text-left capitalize border">
            <span>{{ env }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(key, index) in secretKeys" :key="key"
          v-motion class="border"
          :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
          :duration="600" :delay="100 * index"
        >
          <td class="flex flex-row items-center justify-between relative p-2 font-bold text-muted-foreground text-sm font-mono">
            <span class="truncate max-w-[80%]">{{ key }}</span>
            <span class="button-group">
              <button @click="toggleVisibility(key)">
                <Icon :name="visibleKeys[key] ? 'carbon:view' : 'carbon:view-off'" size="20" class="hover:scale-md hover:text-accent transition-all duration-500" />
              </button>
              <button @click="updateSecret(key)">
                <Icon name="carbon:edit" size="20" class="hover:scale-md hover:text-accent transition-all duration-500" />
              </button>
              <button @click="handleDeleteSecret(key)">
                <Icon name="carbon:delete" size="20" class="hover:scale-md hover:text-danger transition-all duration-500" />
              </button>
            </span>
          </td>

          <td v-for="env in environments" :key="env" class="p-2 border text-muted-foreground text-sm font-mono">
            <div class="flex flex-row items-center justify-between">
              <span
                class="truncate max-w-[80%] select-none"
                :class="[
                  !getSecretValue(key, env) ? '' : 'bg-card px-1 rounded cursor-pointer hover:scale-sm hover:text-primary transition-all duration-500',
                ]" @click="copyToClipboard(getSecretValue(key, env))"
              >
                {{ renderValue(key, env) }}
              </span>

              <button @click="copyToClipboard(getSecretValue(key, env))">
                <Icon name="carbon:copy" size="20" class="hover:scale-md hover:text-accent transition-all duration-500" />
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

const secretKeys = computed(() => {
  const keys = props.secrets.map(secret => secret.key)
  return keys.sort((a, b) => {
    if (sort.value.direction === "asc")
      return a.localeCompare(b)
    else return b.localeCompare(a)
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
