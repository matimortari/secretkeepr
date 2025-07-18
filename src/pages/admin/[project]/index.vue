<template>
  <div v-motion class="min-h-screen" :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <div class="flex flex-col gap-2">
      <header v-motion class="flex flex-row items-center gap-4 border-b pb-2" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
        <NuxtLink to="/admin/projects">
          <Icon name="ph:arrow-left-bold" size="25" class="text-muted-foreground hover:text-accent md:mt-2" />
        </NuxtLink>
        <h2>
          {{ project?.name }}
        </h2>
        <p v-motion class="hidden md:block text-muted-foreground text-sm mt-2" :initial="{ opacity: 0, x: -10 }" :enter="{ opacity: 1, x: 0 }" :duration="800">
          {{ project?.description || "No description provided." }}
        </p>
      </header>

      <div class="flex flex-row justify-between items-center gap-2" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
        <header class="button-group w-full">
          <h3 class="hidden md:block whitespace-nowrap">
            Secrets Overview
          </h3>
          <div class="relative w-full">
            <span class="absolute inset-y-0 left-0 flex flex-row items-center pl-4 text-muted-foreground">
              <Icon name="ph:magnifying-glass-bold" size="20" />
            </span>
            <input id="search" v-model="searchQuery" type="text" placeholder="Search secrets..." class="w-full pl-10">
          </div>
        </header>

        <div class="flex flex-row items-center gap-2">
          <button class="btn-primary" @click="openDialog('secret')">
            <span>Add New Secret</span>
            <Icon name="ph:plus-bold" size="20" />
          </button>
          <button class="btn-secondary" @click="openDialog('env')">
            <span class="hidden md:block">Import .env File</span>
            <Icon name="ph:upload-bold" size="20" />
          </button>

          <div ref="dropdownRef" class="relative">
            <button class="btn" @click="isDropdownOpen = !isDropdownOpen">
              <span class="hidden md:block">{{ selectedEnvironmentLabel || "Export" }}</span>
              <Icon name="ph:download-bold" size="20" />
            </button>

            <ul v-if="isDropdownOpen" class="dropdown overflow-y-auto scroll-area text-sm">
              <li v-for="env in environments" :key="env" class="p-2 hover:bg-muted rounded cursor-pointer capitalize" @click="selectEnvironment(env)">
                {{ env }}
              </li>
            </ul>
          </div>

          <NuxtLink v-if="project?.id" :to="`/admin/${project.id}/settings`" class="btn">
            <Icon name="ph:gear-bold" size="20" />
          </NuxtLink>
        </div>
      </div>

      <ProjectsSecretsTable :secrets="filteredSecrets" :project-id="project?.id ?? ''" @edit="secret => openDialog('secret', secret)" />

      <ProjectsSecretDialog
        :is-open="isSecretDialogOpen"
        :selected-secret="selectedSecret"
        :project-id="project?.id ?? ''"
        @close="closeDialog"
        @save="handleSaveSecret"
      />

      <ProjectsImportFromEnvDialog
        :is-open="isImportFromEnvDialogOpen"
        :project-id="project?.id ?? ''"
        :existing-secrets="secrets"
        @close="closeDialog"
        @save="handleImportFromEnv"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useSecretsStore } from "~/lib/stores/secrets-store"

const route = useRoute()
const projectId = route.params.project as string
const { project, secrets } = useProjectSecrets(route.params.project as string)

const searchQuery = ref("")
const selectedSecret = ref<SecretType | null>(null)
const activeDialog = ref<"secret" | "env" | null>(null)
const isSecretDialogOpen = computed(() => activeDialog.value === "secret")
const isImportFromEnvDialogOpen = computed(() => activeDialog.value === "env")
const selectedEnvironment = ref("")
const environments = ["development", "staging", "production"]
const dropdownRef = ref<HTMLElement | null>(null)
const isDropdownOpen = ref(false)

useClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false
}, { escapeKey: true })

const selectedEnvironmentLabel = computed(() => (selectedEnvironment.value ? selectedEnvironment.value : ""))

function selectEnvironment(env: string) {
  selectedEnvironment.value = env
  isDropdownOpen.value = false
  handleExportToEnv()
}

const filteredSecrets = computed(() =>
  secrets.value.filter(secret => secret.key.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

function openDialog(type: "secret" | "env", secret?: SecretType) {
  selectedSecret.value = type === "secret" ? secret || null : null
  activeDialog.value = type
}

function closeDialog() {
  activeDialog.value = null
  selectedSecret.value = null
}

async function handleImportFromEnv(importedSecrets: SecretType[]) {
  closeDialog()
  const secretsStore = useSecretsStore()

  try {
    for (const secret of importedSecrets) {
      const existingSecret = secretsStore.secrets.find(s => s.key === secret.key)

      if (existingSecret) {
        const incomingEnv = secret.values?.[0]?.environment
        const envExists = (existingSecret.values ?? []).some(v => v.environment === incomingEnv)

        if (envExists) {
          console.warn(`Secret with key "${secret.key}" already has value for environment "${incomingEnv}". Skipping.`)
          continue
        }

        const updatedValues = [...(existingSecret.values ?? []), ...(secret.values ?? [])]

        await secretsStore.updateSecret(projectId, existingSecret.id!, {
          key: existingSecret.key,
          values: updatedValues,
        })
      }
      else {
        // Secret doesn't exist, create new
        await secretsStore.createSecret(projectId, {
          key: secret.key,
          values: secret.values ?? [],
        })
      }
    }

    await secretsStore.getSecretsByProject(projectId)
  }
  catch (error) {
    console.error("Failed to import secrets:", error)
  }
}

async function handleExportToEnv() {
  if (!selectedEnvironment.value)
    return

  try {
    const secrets = useSecretsStore().secrets.filter(s => s.projectId === projectId)
    const env = selectedEnvironment.value
    const filteredSecrets = secrets
      .map((secret) => {
        const val = secret.values?.find(v => v.environment === env)?.value
        return val ? `${secret.key}=${val}` : null
      })
      .filter(Boolean)
      .join("\n")

    const url = URL.createObjectURL(new Blob([filteredSecrets], { type: "text/plain" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectId}-${env}.env`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  catch (error) {
    console.error("Failed to export secrets:", error)
  }
  finally {
    selectedEnvironment.value = ""
  }
}

async function handleSaveSecret(secret: SecretType) {
  closeDialog()
  try {
    if (secret.id) {
      await useSecretsStore().updateSecret(projectId, secret.id, {
        key: secret.key,
        values: secret.values ?? [],
      })
    }
    else {
      await useSecretsStore().createSecret(projectId, {
        key: secret.key,
        values: secret.values ?? [],
      })
    }
    await useSecretsStore().getSecretsByProject(projectId)
  }
  catch (error) {
    console.error("Failed to create or update secret:", error)
  }
}

onMounted(async () => {
  if (!useProjectsStore().projects?.length) {
    await useProjectsStore().getProjects()
  }
  await useSecretsStore().getSecretsByProject(projectId)
})

watch(() => projectId, async (id) => {
  await useProjectsStore().getProjects()
  await useSecretsStore().getSecretsByProject(id)

  const newProject = useProjectsStore().projects?.find(p => p.id === id)
  const titleName = newProject?.name

  useHead({
    title: `${titleName} – SecretKeepR`,
    link: [{ rel: "canonical", href: `https://secretkeepr.vercel.app/${id}` }, { rel: "icon", href: "/favicon.ico" }],

    meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
  })

  useSeoMeta({
    title: `${titleName} – SecretKeepR`,
    description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
  })
}, { immediate: true })

definePageMeta({
  layout: "admin",
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: "/sign-in",
  },
})
</script>
