<template>
  <div
    v-motion class="flex flex-col items-center justify-center"
    :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 1000 }"
  >
    <header
      v-motion class="flex flex-col items-center gap-4 border-b p-4 text-center"
      :initial="{ opacity: 0, y: 20, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ duration: 800 }"
    >
      <h1>Join an Organization</h1>
      <p class="text-caption">
        To join an organization, please enter your invite token below.
      </p>
    </header>

    <form class="flex w-[90%] flex-col items-center gap-2 p-4" @submit.prevent="handleAcceptInvite">
      <input
        v-model="token" placeholder="Invite Token"
        class="w-full" type="text"
        autofocus
      >
      <button class="btn-primary w-full" type="submit">
        Accept Invite
      </button>
    </form>

    <p class="text-caption flex min-h-6 flex-col items-center gap-2">
      <span v-if="orgStore.error" class="text-danger-foreground">{{ orgStore.error }}</span>
      <span v-else-if="joinOrgSuccess" class="text-success-foreground">
        {{ joinOrgSuccess }}
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"

const route = useRoute()
const router = useRouter()
const token = ref(route.query.token as string || "")

const orgStore = useOrganizationStore()
const joinOrgSuccess = ref("")

async function handleAcceptInvite() {
  orgStore.error = null
  joinOrgSuccess.value = ""

  if (!token.value)
    return

  try {
    await orgStore.acceptInvite(token.value)
    joinOrgSuccess.value = "Invitation accepted! Redirecting..."
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
