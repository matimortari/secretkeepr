<template>
  <div class="flex flex-col gap-2 border-b">
    <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
      <h4>
        User Information
      </h4>
      <p class="text-sm text-muted-foreground">
        Manage your account information.
      </p>
    </header>

    <form class="flex flex-col gap-2 p-2 md:w-1/2" @submit.prevent="handleSubmit">
      <label class="text-sm font-medium">Full Name</label>
      <input v-model="form.name" type="text" placeholder="Enter your name">

      <label class="text-sm font-medium">Email</label>
      <input :value="user?.email" type="email" class="bg-muted cursor-not-allowed" readonly>

      <label class="text-sm font-medium">User ID</label>
      <input :value="user?.id" type="text" class="bg-muted cursor-not-allowed" readonly>

      <label class="text-sm font-medium">Active Organization</label>
      <input :value="selectedOrganization?.name" class="bg-muted cursor-not-allowed" readonly>

      <label class="text-sm font-medium">Active Organization Role</label>
      <input :value="currentMembership?.role" class="bg-muted cursor-not-allowed capitalize" readonly>

      <p class="flex flex-col md:flex-row gap-2 text-sm">
        Joined On <span class="text-muted-foreground">{{ user?.createdAt?.toLocaleString() }}</span>
      </p>

      <button class="btn-primary self-start" type="submit">
        <Icon name="ph:check-circle" size="20" />
        <span>Save Changes</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  user: UserType | null
}>()

const form = ref({
  name: props.user?.name || "",
})

watch(() => useUserStore().user, (newUser) => {
  form.value.name = newUser?.name || ""
}, { immediate: true })

const selectedOrganization = computed(() => useOrganizationStore().selectedOrganization)

const currentMembership = computed(() => {
  const org = selectedOrganization.value
  const user = useUserStore().user
  if (!org || !user || !user.memberships)
    return null

  return user.memberships.find(m => m.organization?.id === org.id) || null
})

async function handleSubmit() {
  if (!props.user)
    return

  try {
    await useUserStore().updateUser({
      name: form.value.name,
      image: props.user.image ?? undefined,
    })
    await useUserStore().getUser()
  }
  catch (error) {
    console.error("Failed to update user data:", error)
  }
}
</script>
