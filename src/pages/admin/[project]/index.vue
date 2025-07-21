<template>
  <div
    v-motion class="min-h-screen"
    :initial="{ opacity: 0 }" :enter="{ opacity: 1 }"
    :duration="800"
  >
    <div class="flex flex-col gap-2">
      <header
        v-motion class="navigation-group flex-nowrap justify-between border-b pb-2"
        :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
        :duration="800" :delay="200"
      >
        <div class="navigation-group shrink-0">
          <NuxtLink to="/admin/projects">
            <Icon name="ph:arrow-left-bold" size="25" class="text-muted-foreground hover:text-accent md:mt-2" />
          </NuxtLink>
          <h2 class="max-w-lg truncate">
            {{ project?.name }}
          </h2>
        </div>

        <div
          v-motion class="navigation-group overflow-hidden"
          :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
          :duration="800" :delay="200"
        >
          <button class="btn-primary" @click="openDialog('secret')">
            <span class="hidden md:inline">Add New Secret</span>
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

            <Transition name="dropdown" mode="out-in">
              <ul v-if="isDropdownOpen" class="dropdown scroll-area overflow-y-auto text-sm">
                <li v-for="env in environments" :key="env" class="cursor-pointer rounded p-2 capitalize hover:bg-muted" @click="selectEnvironment(env)">
                  {{ env }}
                </li>
              </ul>
            </Transition>
          </div>

          <NuxtLink v-if="project?.id" :to="`/admin/${project.id}/settings`" class="btn">
            <Icon name="ph:gear-bold" size="20" />
          </NuxtLink>
        </div>
      </header>

      <ProjectsSecretsTable :secrets="secrets" :project-id="project?.id ?? ''" @edit="secret => openDialog('secret', secret)" />

      <ProjectsSecretDialog
        :is-open="isSecretDialogOpen"
        :selected-secret="selectedSecret"
        :project-id="project?.id ?? ''"
        @close="closeDialog"
        @save="handleSaveSecret"
      />

      <ProjectsSecretImportDialog
        :is-open="isSecretImportDialogOpen"
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
const projectsStore = useProjectsStore()
const secretsStore = useSecretsStore()

const selectedSecret = ref<SecretType | null>(null)
const activeDialog = ref<"secret" | "env" | null>(null)
const isSecretDialogOpen = computed(() => activeDialog.value === "secret")
const isSecretImportDialogOpen = computed(() => activeDialog.value === "env")
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
  try {
    for (const secret of importedSecrets) {
      const existingSecret = secretsStore.secrets.find(s => s.key === secret.key)
      if (existingSecret) {
        const updatedValues = [...(existingSecret.values ?? []), ...(secret.values ?? [])]

        await secretsStore.updateSecret(projectId, existingSecret.id!, {
          key: existingSecret.key,
          values: updatedValues,
        })
      }
      else {
        await secretsStore.createSecret(projectId, {
          key: secret.key,
          values: secret.values ?? [],
        })
      }
    }

    await secretsStore.getSecretsByProject(projectId)
  }
  catch (error: any) {
    console.error("Failed to import secrets:", error)
  }
}

async function handleExportToEnv() {
  if (!selectedEnvironment.value)
    return

  try {
    const secrets = secretsStore.secrets.filter(s => s.projectId === projectId)
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
  catch (error: any) {
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
      await secretsStore.updateSecret(projectId, secret.id, {
        key: secret.key,
        description: secret.description ?? "",
        values: secret.values ?? [],
      })
    }
    else {
      await secretsStore.createSecret(projectId, {
        key: secret.key,
        description: secret.description ?? "",
        values: secret.values ?? [],
      })
    }
    await secretsStore.getSecretsByProject(projectId)
  }
  catch (error: any) {
    console.error("Failed to create or update secret:", error)
  }
}

onMounted(async () => {
  if (!projectsStore.projects?.length) {
    await projectsStore.getProjects()
  }
  await secretsStore.getSecretsByProject(projectId)
})

watch(() => projectId, async (id) => {
  await projectsStore.getProjects()
  await secretsStore.getSecretsByProject(id)

  const newProject = projectsStore.projects?.find(p => p.id === id)
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

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(0.25rem);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
