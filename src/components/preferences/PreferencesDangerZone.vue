<template>
  <div class="flex flex-col">
    <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
      <h4>
        Danger Zone
      </h4>
      <p class="text-caption">
        Manage critical actions related to your account.
      </p>
    </header>

    <section class="md:navigation-group flex flex-col gap-2 border-b p-2 md:justify-between">
      <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
        <h5>
          Delete Account
        </h5>
        <p class="text-caption text-danger-foreground">
          This action is irreversible. All your data will be lost.
        </p>
      </header>

      <button class="btn-danger" @click="handleDeleteUser">
        <Icon name="ph:user-minus-bold" size="20" />
        <span>Delete Account</span>
      </button>
    </section>

    <p v-if="errorMsg" class="text-caption px-2 text-danger-foreground">
      {{ errorMsg }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/lib/stores/user-store"

const { signOut } = useAuth()
const userStore = useUserStore()

const errorMsg = ref("")

async function handleDeleteUser() {
  errorMsg.value = ""
  if (!confirm("Are you sure you want to delete your account?"))
    return

  try {
    await userStore.deleteUser()
    await signOut({ callbackUrl: "/" })
  }
  catch (error: any) {
    console.error("Failed to delete user:", error)
    errorMsg.value = error?.message || "Failed to delete user account."
  }
}
</script>
