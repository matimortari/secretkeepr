<template>
  <div class="flex flex-col">
    <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
      <h4>Danger Zone</h4>
      <p class="text-caption">
        Manage critical actions related to the organization.
      </p>
    </header>

    <section class="md:navigation-group flex flex-col gap-2 border-b p-2 md:justify-between">
      <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
        <h5>Leave Organization</h5>
        <p class="text-caption text-danger-foreground">
          You will lose access to all resources in this organization.
        </p>
      </header>

      <div class="flex flex-col gap-2 md:flex-row">
        <p v-if="leaveOrgError" class="text-caption flex items-center px-2 text-danger-foreground">
          {{ leaveOrgError }}
        </p>

        <button class="btn-danger" @click="handleLeaveOrg">
          <Icon name="ph:sign-out-bold" size="20" />
          <span>Leave Organization</span>
        </button>
      </div>
    </section>

    <section class="md:navigation-group flex flex-col gap-2 border-b p-2 md:justify-between">
      <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
        <h5>Delete Organization</h5>
        <p class="text-caption text-danger-foreground">
          This action is irreversible. All data associated with the organization will be lost.
        </p>
      </header>

      <div class="flex flex-col gap-2 md:flex-row">
        <p v-if="deleteOrgError" class="text-caption flex items-center px-2 text-danger-foreground">
          {{ deleteOrgError }}
        </p>

        <button class="btn-danger" @click="handleDeleteOrg">
          <Icon name="ph:network-x-bold" size="20" />
          <span>Delete Organization</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  org: OrganizationType | null
}>()

const router = useRouter()
const userStore = useUserStore()
const orgStore = useOrganizationStore()
const leaveOrgError = ref<string | null>(null)
const deleteOrgError = ref<string | null>(null)

async function handleLeaveOrg() {
  leaveOrgError.value = null
  if (!props.org?.id || !userStore.user?.id) {
    leaveOrgError.value = "Missing organization or user ID."
    return
  }
  if (!confirm("Are you sure you want to leave this organization?"))
    return

  try {
    await orgStore.removeOrgMember(userStore.user.id, props.org.id)
    await router.push("/setup/create-org")
  }
  catch (error: any) {
    leaveOrgError.value = error.message || "An error occurred while leaving the organization."
    console.error("Leave org error:", error)
  }
}

async function handleDeleteOrg() {
  deleteOrgError.value = null
  if (!props.org?.id) {
    deleteOrgError.value = "Organization ID is undefined."
    return
  }
  if (!confirm("Are you sure you want to delete this organization? This action cannot be undone."))
    return

  try {
    const result = await orgStore.deleteOrg(props.org.id)
    if (result?.message === "Organization deleted successfully") {
      await userStore.getUser()
      if (!userStore.user?.memberships?.length) {
        await router.push("/setup/create-org")
      }
      else {
        await router.push("/admin/projects")
      }
    }
  }
  catch (error: any) {
    deleteOrgError.value = error.message || "An error occurred while deleting the organization."
    console.error("Delete org error:", error)
  }
}
</script>
