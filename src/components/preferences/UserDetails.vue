<template>
  <div class="flex flex-col border-b">
    <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
      <h4>User Information</h4>
      <p class="text-caption">
        Manage your account information.
      </p>
    </header>

    <form class="flex flex-col gap-2 p-2" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-4 md:flex-row md:gap-8">
        <div class="flex flex-col gap-2 md:w-1/2">
          <label class="text-label" for="name">Full Name</label>
          <input id="name" v-model="form.name" type="text" placeholder="Enter your name">

          <span class="text-label" for="activeOrgId">Active Organization: <span class="text-muted-foreground">{{ selectedOrganization?.name }}</span></span>
          <span class="text-label" for="activeOrgId">Active Organization Role: <span class="text-muted-foreground">{{ currentMembership?.role }}</span></span>
          <span class="text-label" for="email">Email: <span class="text-muted-foreground">{{ user?.email }}</span></span>
          <span class="text-label" for="userId">User ID: <span class="text-muted-foreground">{{ user?.id }}</span></span>
          <span class="text-label" for="createdAt">Joined On: <span class="text-muted-foreground">{{ formatDate(user?.createdAt) }}</span></span>
          <span class="text-label" for="cliToken">CLI Token: <span class="text-muted-foreground">{{ user?.cliTokens?.[0]?.token ?? 'No token available' }}</span></span>
        </div>

        <div class="flex flex-col items-center md:w-1/2">
          <h5>Profile Image</h5>

          <img v-if="form.image" :src="form.image" alt="Profile preview" class="size-24 rounded-full border object-cover">
          <input
            id="image"
            type="file"
            accept="image/*"
            class="cursor-pointer opacity-0"
            @change="handleImageChange"
          >
          <label for="image" class="btn">
            <Icon name="ph:image-bold" size="20" />
            <span>Change Image</span>
          </label>
        </div>
      </div>

      <section class="md:navigation-group flex flex-col gap-2 p-2 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-2 md:flex-row md:items-center">
          <button class="btn-primary md:self-start" type="submit">
            <Icon name="ph:check-circle" size="20" />
            <span>Save Changes</span>
          </button>

          <p v-if="userStore.error" class="text-caption text-danger-foreground">
            {{ userStore.error }}
          </p>
        </div>
      </section>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"
import { formatDate } from "~/lib/utils"

const props = defineProps<{
  user: UserType | null
}>()

const userStore = useUserStore()
const orgStore = useOrganizationStore()

const form = ref({
  name: props.user?.name || "",
  image: props.user?.image || "",
})

watch(() => userStore.user, (newUser) => {
  form.value.name = newUser?.name || ""
  form.value.image = newUser?.image || ""
}, { immediate: true })

const selectedOrganization = computed(() => orgStore.selectedOrg)

const currentMembership = computed(() => {
  const org = selectedOrganization.value
  const user = userStore.user
  if (!org || !user || !user.memberships)
    return null

  return user.memberships.find(m => m.organization?.id === org.id) || null
})

async function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0)
    return

  const file = input.files[0]
  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", "avatar")

  userStore.error = null
  try {
    const response = await userStore.updateUserImage(formData)
    form.value.image = response.imageUrl
    if (userStore.user) {
      userStore.user.image = response.imageUrl
    }
  }
  catch (error: any) {
    console.error("Image upload failed:", error)
  }
}

async function handleSubmit() {
  if (!userStore.user)
    return

  userStore.error = null
  try {
    const result = await userStore.updateUser({
      name: form.value.name,
      image: userStore.user.image ?? undefined,
    })
    if (!result)
      throw new Error("Update failed")
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to update user data:", error)
  }
}
</script>
