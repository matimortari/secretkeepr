<template>
  <div class="flex flex-col">
    <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
      <h4>
        Danger Zone
      </h4>
      <p class="text-caption">
        Manage critical actions related to the organization.
      </p>
    </header>

    <section class="md:navigation-group flex flex-col gap-2 border-b p-2 md:justify-between">
      <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
        <h5>
          Leave Organization
        </h5>
        <p class="text-caption text-danger-foreground">
          You will lose access to all resources in this organization.
        </p>
      </header>

      <div class="flex flex-col items-center gap-2 md:flex-row">
        <p v-if="leaveErrorMsg" class="text-caption px-2 text-danger-foreground">
          {{ leaveErrorMsg }}
        </p>
        <button class="btn-danger" @click="handleLeaveOrganization">
          <Icon name="ph:sign-out-bold" size="20" />
          <span>Leave Organization</span>
        </button>
      </div>
    </section>

    <section class="md:navigation-group flex flex-col gap-2 border-b p-2 md:justify-between">
      <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
        <h5>
          Delete Organization
        </h5>
        <p class="text-caption text-danger-foreground">
          This action is irreversible. All data associated with the organization will be lost.
        </p>
      </header>

      <div class="flex flex-col items-center gap-2 md:flex-row">
        <p v-if="deleteErrorMsg" class="text-caption px-2 text-danger-foreground">
          {{ deleteErrorMsg }}
        </p>
        <button class="btn-danger" @click="handleDeleteOrganization">
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
  organization: OrganizationType | null
}>()

const router = useRouter()
const userStore = useUserStore()
const organizationStore = useOrganizationStore()

const leaveErrorMsg = ref("")
const deleteErrorMsg = ref("")

async function handleLeaveOrganization() {
  leaveErrorMsg.value = ""
  if (!props.organization?.id || !userStore.user?.id) {
    leaveErrorMsg.value = "Missing organization or user ID."
    return
  }
  if (!confirm("Are you sure you want to leave this organization?"))
    return

  await organizationStore.removeOrganizationMember(userStore.user.id, props.organization.id)
  if (organizationStore.error) {
    leaveErrorMsg.value = organizationStore.error
    return
  }

  router.push("/setup/create-org")
}

async function handleDeleteOrganization() {
  deleteErrorMsg.value = ""
  if (!props.organization?.id) {
    deleteErrorMsg.value = "Organization ID is undefined."
    return
  }
  if (!confirm("Are you sure you want to delete this organization? This action cannot be undone."))
    return

  try {
    const result = await organizationStore.deleteOrganization(props.organization.id)
    if (result?.message === "Organization deleted successfully") {
      await userStore.getUser()
      if (!userStore.user?.memberships?.length) {
        router.push("/setup/create-org")
      }
      else {
        router.push("/admin/projects")
      }
    }
  }
  catch (error: any) {
    deleteErrorMsg.value = error.message || "An error occurred while deleting the organization."
  }
}
</script>
