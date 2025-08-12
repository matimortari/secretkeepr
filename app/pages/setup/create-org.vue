<template>
  <div class="flex flex-col items-center justify-center">
    <header
      v-motion class="flex flex-col items-center gap-4 border-b-2 p-4 text-center"
      :initial="{ opacity: 0, y: -10, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
      :duration="800"
    >
      <h1>
        Welcome to SecretKeepR
      </h1>
      <p class="text-info">
        To get started, please create an organization name with at least 3 characters.
      </p>
    </header>

    <form
      v-motion class="flex w-[90%] flex-col items-center gap-2 p-4"
      :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
      :duration="800" @submit.prevent="handleCreateOrg"
    >
      <input
        v-model="localOrg.name" placeholder="Organization Name"
        class="w-full" type="text"
        autofocus
      >
      <button class="btn-primary w-full" type="submit" aria-label="Create Organization">
        Create Organization
      </button>
    </form>

    <p class="text-info flex min-h-4 flex-col items-center gap-2">
      <span v-if="orgStore.error" class="text-danger-foreground">{{ orgStore.error }}</span>
      <span> Already have an invite? <nuxt-link to="/setup/join-org" class="text-primary hover:underline">
        Join an Organization.
      </nuxt-link>
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import auth from "~/lib/middleware/auth"
import { useOrganizationStore } from "~/lib/stores/organization-store"

const router = useRouter()
const orgStore = useOrganizationStore()

const localOrg = ref({
  name: "",
})

async function handleCreateOrg() {
  orgStore.error = null
  if (!localOrg.value.name || localOrg.value.name.length < 3) {
    orgStore.error = "Organization name must be at least 3 characters long."
    return
  }

  try {
    await orgStore.createOrg(localOrg.value)
    localOrg.value.name = ""
    router.push("/admin/projects")
  }
  catch (error: any) {
    console.error("Failed to create organization:", error)
    orgStore.error = error.message
  }
}

useHead({
  title: "Create Organization - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/setup/create-org" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Create Organization - SecretKeepR",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
})

definePageMeta({
  layout: "fullscreen",
  middleware: auth,
})
</script>
