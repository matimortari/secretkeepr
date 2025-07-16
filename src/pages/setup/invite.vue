<template>
  <div v-motion class="min-h-screen flex flex-col items-center justify-center" :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }" :transition="{ duration: 1000 }">
    <header v-motion class="flex flex-col items-center text-center gap-4 p-12 border-b" :initial="{ opacity: 0, y: 20, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }" :duration="600">
      <h1>
        Accept Invite
      </h1>
    </header>

    <p class="text-sm p-4">
      To join an organization, please enter your invite token below.
    </p>

    <form class="flex flex-col items-center gap-2 p-4 w-[90%]" @submit.prevent="handleAcceptInvite">
      <input v-model="token" placeholder="Invite Token" class="w-full" type="text" required autofocus>
      <button class="btn-primary w-full" type="submit">
        Accept Invite
      </button>
    </form>

    <p v-if="error" class="my-4 min-h-6 text-sm text-danger">
      {{ error }}
    </p>
    <p v-else-if="success" class="my-4 min-h-6 text-sm text-success">
      Invitation accepted! Redirecting...
    </p>
  </div>
</template>

<script setup lang="ts">
import { acceptOrganizationInviteService } from "~/lib/services/organization-service"

const route = useRoute()
const token = route.query.token as string
const router = useRouter()

const error = ref<string | null>(null)
const success = ref(false)

async function handleAcceptInvite() {
  if (!token) {
    return
  }

  try {
    await acceptOrganizationInviteService(token)
    success.value = true
    setTimeout(() => router.push("/admin/projects"), 2000)
  }
  catch (error) {
    console.error("Failed to accept invite:", error)
  }
}

useHead({
  title: "Accept Invite – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/setup/invite" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Accept Invite – SecretKeepR",
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
