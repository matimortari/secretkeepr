<template>
  <div class="flex flex-col items-center justify-center">
    <header
      v-motion class="flex flex-col items-center gap-4 border-b-2 p-4 text-center"
      :initial="{ opacity: 0, y: -10, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
      :duration="800"
    >
      <h1>
        Welcome to SecretkeepR
      </h1>
      <p class="text-caption">
        To get started, please create an organization name with at least 2 characters.
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

    <p class="text-caption flex min-h-4 flex-col items-center gap-2">
      <span v-if="orgStore.errors.createOrg" class="text-danger-foreground">{{ orgStore.errors.createOrg }}</span>
      <span> Already have an invite? <nuxt-link to="/onboarding/join-org" class="text-primary hover:underline">
        Join an Organization
      </nuxt-link>.
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { createOrgSchema } from "#shared/schemas/org"

const orgStore = useOrganizationStore()

const localOrg = ref({
  name: "",
})

async function handleCreateOrg() {
  orgStore.errors.createOrg = null

  const result = createOrgSchema.safeParse(localOrg.value)
  if (!result.success) {
    const firstError = result.error.issues[0]
    if (firstError?.path[0] === "name") {
      if (firstError?.code === "too_small") {
        orgStore.errors.createOrg = "Organization name must be at least 2 characters long."
      }
      else if (firstError?.code === "too_big") {
        orgStore.errors.createOrg = "Organization name must be no more than 100 characters long."
      }
    }
    else {
      orgStore.errors.createOrg = firstError?.message ?? "An unknown error occurred."
    }
    return
  }

  try {
    await orgStore.createOrg(result.data)
    localOrg.value.name = ""
    navigateTo("/admin/projects")
  }
  catch (err: any) {
    console.error("Failed to create organization:", err)
    orgStore.errors.createOrg = err.message
  }
}

useHead({
  title: "Create Organization",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/onboarding/create-org" }],
  meta: [{ name: "description", content: "Create your organization on SecretkeepR." }],
})

definePageMeta({
  layout: "fullscreen",
  middleware: auth,
})
</script>
