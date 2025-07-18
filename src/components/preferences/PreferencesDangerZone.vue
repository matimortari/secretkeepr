<template>
  <div class="flex flex-col gap-2">
    <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
      <h4>
        Danger Zone
      </h4>
      <p class="text-sm text-muted-foreground">
        Manage critical actions related to your account.
      </p>
    </header>

    <section class="flex flex-col md:flex-row md:items-center md:justify-between px-2 pb-2 border-b">
      <header class="flex flex-col gap-1 items-center text-center md:items-start md:text-start">
        <h5>
          Delete Account
        </h5>
        <p class="text-sm text-danger">
          This action is irreversible. All your data will be lost.
        </p>
      </header>

      <button class="btn-danger" @click="handleDeleteUser">
        <Icon name="ph:user-minus-bold" size="20" />
        <span>Delete Account</span>
      </button>
    </section>

    <p v-if="errorMsg" class="text-sm text-danger px-2">
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
