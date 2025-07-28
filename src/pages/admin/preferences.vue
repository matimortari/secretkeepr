<template>
  <div
    v-motion :initial="{ opacity: 0 }"
    :enter="{ opacity: 1 }" :transition="{ duration: 800 }"
    class="flex flex-col gap-4"
  >
    <header class="border-b pb-2">
      <h2>Preferences</h2>
    </header>

    <div class="flex flex-col gap-4">
      <PreferencesUserDetails :user="user" />
      <PreferencesDangerZone />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/lib/stores/user-store"

const userStore = useUserStore()

const { user } = storeToRefs(userStore)

onMounted(async () => {
  await userStore.getUser()
})

useHead({
  title: "Preferences – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/admin/preferences" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Preferences – SecretKeepR",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
})

definePageMeta({
  layout: "admin",
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: "/sign-in",
  },
})
</script>
