<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <h2 class="border-b py-2">
      Preferences
    </h2>

    <form class="flex flex-col" @submit.prevent="handleSubmit">
      <nav class="md:navigation-group flex flex-col items-center justify-between border-b p-2 text-center md:text-start">
        <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
          <h4>User Information</h4>
          <p class="text-caption">
            Manage your account information.
          </p>
        </header>

        <div class="flex flex-col gap-2 md:flex-row md:items-center">
          <p v-if="userStore.error" class="text-caption text-danger-foreground">
            {{ userStore.error }}
          </p>

          <button class="btn-primary md:self-start" type="submit">
            <Icon name="ph:check-circle" size="20" />
            <span>Save Changes</span>
          </button>
        </div>
      </nav>

      <section class="flex flex-col md:px-8">
        <div v-for="(field, index) in userFields" :key="index" class="md:navigation-group flex flex-col justify-between gap-2 border-b p-4">
          <div class="flex flex-col items-start justify-center gap-1 text-start">
            <h6>
              {{ field.label }}
            </h6>
            <p v-if="field.description" class="text-caption">
              {{ field.description }}
            </p>
          </div>

          <div v-if="field.type === 'input'" class="md:navigation-group">
            <input
              type="text"
              :value="field.model?.value"
              placeholder="Enter value"
              required
              @input="field.update && $event.target && field.update(($event.target as HTMLInputElement).value)"
            >
            <div class="btn" @click="field.onSave">
              <Icon name="ph:check-bold" size="20" />
            </div>
          </div>

          <div v-else-if="field.type === 'image'" class="navigation-group">
            <img v-if="field.src" :src="field.src.value ?? undefined" alt="Profile preview" class="size-10 rounded-full border object-cover">
            <input
              id="image"
              type="file"
              accept="image/*"
              class="hidden"
              @change="field.onUpload"
            >
            <label for="image" class="btn">
              <Icon name="ph:image-bold" size="20" />
            </label>
          </div>

          <div v-else-if="field.copyable" class="navigation-group">
            <span>{{ field.value }}</span>
            <div class="btn" @click="copyToClipboard(field.value?.value || '')">
              <Icon name="ph:clipboard-bold" size="20" />
            </div>
          </div>

          <span v-else class="navigation-group">{{ field.value }}</span>
        </div>
      </section>
    </form>

    <div class="flex flex-col">
      <nav class="md:navigation-group flex w-full flex-col justify-between border-b p-2">
        <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
          <h4>
            Danger Zone
          </h4>
          <p class="text-caption">
            This section contains actions that can significantly affect your account. Please proceed with caution.
          </p>
        </header>
      </nav>

      <section class="md:navigation-group flex flex-col items-start justify-between gap-2 border-b p-4 px-10 text-start">
        <div class="flex flex-col gap-1">
          <h6>
            Delete Account
          </h6>
          <p class="text-caption text-danger-foreground">
            This action is irreversible. All your data will be permanently deleted.
          </p>
        </div>

        <button class="btn-danger" @click="handleDeleteUser">
          <Icon name="ph:user-minus-bold" size="20" />
          <span>Delete Account</span>
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import auth from "~/lib/middleware/auth"
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"
import { copyToClipboard, formatDate } from "~/lib/utils"

const router = useRouter()
const { clear } = useUserSession()
const orgStore = useOrganizationStore()
const userStore = useUserStore()

const currentMembership = computed(() => {
  const user = userStore.user
  if (!orgStore.activeOrg || !user || !user.memberships)
    return null

  return user.memberships.find(m => m.organization?.id === orgStore.activeOrg?.id) || null
})

const userFields = [
  {
    label: "User Name",
    description: "This name will be displayed in your account and projects.",
    type: "input",
    model: computed(() => userStore.user?.name),
    update: (value: string) => {
      if (userStore.user)
        userStore.user.name = value
    },
    onSave: handleSubmit,
  },
  {
    label: "User ID",
    description: "This ID is unique to your account and cannot be changed.",
    value: computed(() => userStore.user?.id),
    copyable: true,
  },
  {
    label: "User Email",
    description: "Your registered email address.",
    value: computed(() => userStore.user?.email),
  },
  {
    label: "Active Organization",
    description: "The organization you are currently working in.",
    value: computed(() => orgStore.activeOrg?.name),
  },
  {
    label: "Active Organization Role",
    description: "Your role within the selected organization.",
    value: computed(() => currentMembership.value?.role),
  },
  {
    label: "Joined On",
    description: "Date you joined SecretKeepR.",
    value: computed(() => formatDate(userStore.user?.createdAt)),
  },
  {
    label: "CLI Token",
    description: "This token is used for CLI access. Keep it secret and secure.",
    value: computed(() => userStore.user?.cliTokens?.[0]?.token),
    copyable: true,
  },
  {
    label: "Profile Image",
    description: "Supported formats: JPG, PNG. Maximum size: 5MB.",
    type: "image",
    src: computed(() => userStore.user?.image),
    onUpload: handleUploadImage,
  },
]

async function handleUploadImage(event: Event) {
  userStore.error = null
  const input = event.target as HTMLInputElement
  if (!input.files)
    return

  const file = input.files[0]
  if (!file)
    return

  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", "avatar")

  try {
    const response = await userStore.updateUserImage(formData)
    if (userStore.user) {
      userStore.user.image = response.imageUrl
    }
    if (userStore.user) {
      userStore.user.image = response.imageUrl
    }
  }
  catch (error: any) {
    console.error("Failed to upload image:", error)
    userStore.error = error?.message || "Failed to upload image."
  }
}

async function handleSubmit() {
  userStore.error = null
  if (!userStore.user?.id)
    return
  if (!userStore.user?.name.trim()) {
    userStore.error = "User name cannot be empty."
    return
  }

  try {
    await userStore.updateUser({
      name: userStore.user?.name.trim(),
      image: userStore.user.image ?? undefined,
    })
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to update user data:", error)
    userStore.error = error?.message || "Failed to update user data."
  }
}

async function handleDeleteUser() {
  userStore.error = null
  if (!confirm("Are you sure you want to delete your account? This action cannot be undone."))
    return

  try {
    await userStore.deleteUser()
    clear()
    await router.push("/")
  }
  catch (error: any) {
    console.error("Failed to delete account:", error)
    userStore.error = error?.message || "Failed to delete account."
  }
}

watch(() => userStore.user, (newUser: UserType | null) => {
  if (newUser && userStore.user) {
    userStore.user.name = newUser.name
    userStore.user.image = newUser.image
  }
}, { immediate: true })

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
  middleware: auth,
})
</script>
