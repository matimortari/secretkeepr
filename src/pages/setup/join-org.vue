<template>
  <div
    v-motion class="flex min-h-screen flex-col items-center justify-center"
    :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 1000 }"
  >
    <header
      v-motion class="flex flex-col items-center gap-4 border-b p-4 text-center"
      :initial="{ opacity: 0, y: 20, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
      :duration="600"
    >
      <h1>
        Join an Organization
      </h1>
      <p class="text-caption p-2">
        To join an organization, please enter your invite token below.
      </p>
    </header>

    <form class="flex w-[90%] flex-col items-center gap-2 p-4" @submit.prevent="handleAcceptInvite">
      <input
        v-model="token" placeholder="Invite Token"
        class="w-full" type="text"
        required autofocus
      >
      <button class="btn-primary w-full" type="submit">
        Accept Invite
      </button>
    </form>

    <p class="text-caption min-h-6">
      <span v-if="error" class="text-danger">{{ error }}</span>
      <span v-else-if="success" class="text-success">
        Invitation accepted! Redirecting...
      </span>
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
  catch (error: any) {
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
