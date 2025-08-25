<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <header class="navigation-group border-b py-2">
      <nuxt-link to="/admin/projects" class="flex items-center">
        <icon name="ph:arrow-left-bold" size="25" class="hover:scale-sm text-muted-foreground hover:text-accent" />
      </nuxt-link>
      <h2 class="max-w-lg truncate">
        {{ project?.name }}
      </h2>

      <nav class="navigation-group w-full flex-1 justify-end" aria-label="Project Actions">
        <button class="btn-primary" aria-label="Add New Secret" @click="() => { isDialogOpen = true; dialogType = 'secret'; selectedSecret = null }">
          <span class="hidden md:inline">Add New Secret</span>
          <icon name="ph:plus-bold" size="20" />
        </button>

        <button class="btn-secondary" aria-label="Import Secrets from .env File" @click="() => { isDialogOpen = true; dialogType = 'env'; selectedSecret = null }">
          <span class="hidden md:block">Import</span>
          <icon name="ph:upload-bold" size="20" />
        </button>

        <div ref="dropdownRef" class="relative">
          <button class="btn" aria-label="Export Secrets to .env File" @click="isDropdownOpen = !isDropdownOpen">
            <span class="hidden md:block">Export</span>
            <icon name="ph:download-bold" size="20" />
          </button>

          <transition name="dropdown" mode="out-in">
            <ul v-if="isDropdownOpen" class="dropdown scroll-area overflow-y-auto text-sm" role="menu" aria-label="Export environments">
              <li
                v-for="env in ['development', 'staging', 'production']" :key="env"
                role="menuitem" class="rounded p-2 capitalize hover:bg-muted"
                @click="handleExportToEnv(env); isDropdownOpen = false"
              >
                {{ env }}
              </li>
            </ul>
          </transition>
        </div>

        <nuxt-link v-if="project?.id" :to="`/admin/${project.slug}/settings`" class="btn">
          <icon name="ph:gear-bold" size="20" />
        </nuxt-link>
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
const route = useRoute()
const slug = route.params.project as string
const projectsStore = useProjectsStore()
const secretsStore = useSecretsStore()

const project = computed(() => {
  return projectsStore.projects.find(p => p.slug === slug) || null
})

const projectId = computed(() => project.value?.id ?? "")
const { handleImportFromEnv, handleExportToEnv } = useEnvFile(projectId.value)
const { secrets } = storeToRefs(secretsStore)

const selectedSecret = ref<SecretType | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dialogType = ref<"secret" | "env" | null>(null)
const isDialogOpen = ref(false)
const isDropdownOpen = ref(false)

useClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false
}, { escapeKey: true })

async function handleSaveSecret(secret: SecretType) {
  isDialogOpen.value = false
  dialogType.value = null
  selectedSecret.value = null

  try {
    if (secret.id) {
      await secretsStore.updateSecret(projectId.value, secret.id, {
        key: secret.key,
        description: secret.description ?? "",
        values: secret.values ?? [],
      })
    }
    else {
      await secretsStore.createSecret(projectId.value, {
        key: secret.key,
        description: secret.description ?? "",
        values: secret.values ?? [],
      })
    }
    await secretsStore.getSecretsByProject(projectId.value)
  }
  catch (error: any) {
    console.error("Failed to create or update secret:", error)
    secretsStore.error = error.message
  }
}

watch(() => projectId.value, async (id) => {
  if (!id)
    return

  await secretsStore.getSecretsByProject(id)
  const projectTitle = projectsStore.projects?.find(p => p.id === id)?.name

  useHead({
    title: `${projectTitle} - SecretKeepR`,
    link: [{ rel: "canonical", href: `https://secretkeepr.vercel.app/${id}` }, { rel: "icon", href: "/favicon.ico" }],
    meta: [{ name: "description", content: `${projectTitle} project page.` }],
  })

  useSeoMeta({
    title: `${projectTitle} - SecretKeepR`,
    description: `${projectTitle} project page.`,
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
