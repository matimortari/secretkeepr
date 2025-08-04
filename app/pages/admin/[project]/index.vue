<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <header class="navigation-group border-b pb-2">
      <NuxtLink to="/admin/projects">
        <Icon name="ph:arrow-left-bold" size="25" class="hover:scale-sm text-muted-foreground hover:text-accent md:mt-2" />
      </NuxtLink>
      <h2 class="max-w-lg truncate">
        {{ project?.name }}
      </h2>

      <nav class="navigation-group w-full flex-1 justify-end">
        <button class="btn-primary" @click="() => { isDialogOpen = true; dialogType = 'secret'; selectedSecret = null }">
          <span class="hidden md:inline">Add New Secret</span>
          <Icon name="ph:plus-bold" size="20" />
        </button>

        <button class="btn-secondary" @click="() => { isDialogOpen = true; dialogType = 'env'; selectedSecret = null }">
          <span class="hidden md:block">Import</span>
          <Icon name="ph:upload-bold" size="20" />
        </button>

        <div ref="dropdownRef" class="relative">
          <button class="btn" @click="isDropdownOpen = !isDropdownOpen">
            <span class="hidden md:block">Export</span>
            <Icon name="ph:download-bold" size="20" />
          </button>

          <Transition name="dropdown" mode="out-in">
            <ul v-if="isDropdownOpen" class="dropdown scroll-area overflow-y-auto text-sm">
              <li
                v-for="env in ['development', 'staging', 'production']" :key="env"
                class="rounded p-2 capitalize hover:bg-muted"
                @click="() => { selectedEnvironment = env; isDropdownOpen = false; handleExportToEnv(); }"
              >
                {{ env }}
              </li>
            </ul>
          </Transition>
        </div>

        <NuxtLink v-if="project?.id" :to="`/admin/${project.id}/settings`" class="btn">
          <Icon name="ph:gear-bold" size="20" />
        </NuxtLink>
      </nav>
    </header>

    <p v-if="!secrets.length" class="text-info my-8 h-[80vh] text-center">
      No secrets found for this project. Add a new secret or import from an .env file to get started.
    </p>

    <ProjectSecrets
      v-if="secrets.length"
      :secrets="secrets"
      :project-id="project?.id ?? ''"
      @edit="(secret: SecretType) => { isDialogOpen = true; dialogType = 'secret'; selectedSecret = secret }"
    />

    <ProjectSecretDialog
      :is-open="isDialogOpen && dialogType === 'secret'"
      :selected-secret="selectedSecret"
      :project-id="project?.id ?? ''"
      @close="() => { isDialogOpen = false; dialogType = null; selectedSecret = null }"
      @save="handleSaveSecret"
    />

    <ProjectSecretImportDialog
      :is-open="isDialogOpen && dialogType === 'env'"
      :project-id="project?.id ?? ''"
      :existing-secrets="secrets"
      @close="() => { isDialogOpen = false; dialogType = null; selectedSecret = null }"
      @save="handleImportFromEnv"
    />
  </div>
</template>

<script setup lang="ts">
import auth from "~/lib/middleware/auth"
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useSecretsStore } from "~/lib/stores/secrets-store"

const route = useRoute()
const projectId = route.params.project as string
const { project, secrets } = useProjectSecrets(projectId)
const projectsStore = useProjectsStore()
const secretsStore = useSecretsStore()

const selectedSecret = ref<SecretType | null>(null)
const selectedEnvironment = ref("")
const dropdownRef = ref<HTMLElement | null>(null)
const dialogType = ref<"secret" | "env" | null>(null)
const isDialogOpen = ref(false)
const isDropdownOpen = ref(false)

useClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false
}, { escapeKey: true })

async function handleImportFromEnv(importedSecrets: SecretType[]) {
  isDialogOpen.value = false
  dialogType.value = null
  selectedSecret.value = null

  try {
    await Promise.all(importedSecrets.map(async (secret) => {
      const existing = secretsStore.secrets.find(s => s.key === secret.key)
      if (existing) {
        const updatedValues = [...(existing.values ?? []), ...(secret.values ?? [])]
        return secretsStore.updateSecret(projectId, existing.id!, {
          key: existing.key,
          values: updatedValues,
        })
      }
      else {
        return secretsStore.createSecret(projectId, {
          key: secret.key,
          values: secret.values ?? [],
        })
      }
    }))
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
    const env = selectedEnvironment.value
    const filteredSecrets = secretsStore.secrets
      .filter(s => s.projectId === projectId)
      .map((s) => {
        const val = s.values?.find(v => v.environment === env)?.value
        return val ? `${s.key}="${val}"` : null
      })
      .filter(Boolean)
      .join("\n\n")

    const url = URL.createObjectURL(new Blob([filteredSecrets], { type: "text/plain" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `.env.${project.value?.name}.${env}`
    a.click()
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
  isDialogOpen.value = false
  dialogType.value = null
  selectedSecret.value = null

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
  const projectTitle = projectsStore.projects?.find(p => p.id === id)?.name

  useHead({
    title: `${projectTitle} – SecretKeepR`,
    link: [{ rel: "canonical", href: `https://secretkeepr.vercel.app/${id}` }, { rel: "icon", href: "/favicon.ico" }],
    meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
  })

  useSeoMeta({
    title: `${projectTitle} – SecretKeepR`,
    description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
  })
}, { immediate: true })

definePageMeta({
  layout: "admin",
  middleware: auth,
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
