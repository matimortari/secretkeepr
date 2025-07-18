<template>
  <div
    v-motion class="min-h-screen flex flex-col items-center justify-center"
    :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 1000 }"
  >
    <header
      v-motion class="flex flex-col items-center text-center gap-4 p-4 border-b"
      :initial="{ opacity: 0, y: 20, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
      :duration="600"
    >
      <h1>
        Welcome to SecretKeepR
      </h1>
    </header>

    <p class="text-sm p-4">
      To get started, please create an organization name with at least 3 characters.
    </p>

    <form class="flex flex-col items-center gap-2 p-4 w-[90%]" @submit.prevent="handleCreateOrganization">
      <input
        v-model="localOrganization.name" placeholder="Organization Name"
        class="w-full" type="text"
        required autofocus
      >
      <button class="btn-primary w-full" type="submit">
        Create Organization
      </button>
    </form>

    <p class="min-h-6 text-sm text-muted-foreground">
      Already have an invite? <NuxtLink to="/setup/join-org" class="text-primary hover:underline">
        Join an Organization.
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const router = useRouter()
const userStore = useUserStore()
const organizationStore = useOrganizationStore()

const localOrganization = ref({
  name: "",
})

async function handleCreateOrganization() {
  if (!localOrganization.value.name)
    return

  try {
    await organizationStore.createOrganization(localOrganization.value)
    localOrganization.value.name = ""
    await userStore.getUser()
    router.push("/admin/projects")
  }
  catch (error: any) {
    console.error("Failed to create organization:", error)
  }
}

useHead({
  title: "Create Organization – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/setup/create-org" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Create Organization – SecretKeepR",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
})

definePageMeta({
  layout: "fullscreen",
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: "/sign-in",
  },
})
</script>
