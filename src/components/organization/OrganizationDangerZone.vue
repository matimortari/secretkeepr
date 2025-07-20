<template>
  <div class="flex flex-col gap-2">
    <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
      <h4>
        Danger Zone
      </h4>
      <p class="text-sm text-muted-foreground">
        Manage critical actions related to the organization.
      </p>
    </header>

    <section class="flex flex-col md:navigation-group md:justify-between p-2 border-b">
      <header class="flex flex-col gap-1 items-center text-center md:items-start md:text-start">
        <h5>
          Leave Organization
        </h5>
        <p class="text-sm text-danger">
          You will lose access to all resources in this organization.
        </p>
      </header>

      <button class="btn-danger" @click="handleLeaveOrganization">
        <Icon name="ph:sign-out-bold" size="20" />
        <span>Leave Organization</span>
      </button>
    </section>

    <section class="flex flex-col md:navigation-group md:justify-between p-2 border-b">
      <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start">
        <h5>
          Delete Organization
        </h5>
        <p class="text-sm text-danger">
          This action is irreversible. All data associated with the organization will be lost.
        </p>
      </header>

      <button class="btn-danger" @click="handleDeleteOrganization">
        <Icon name="ph:network-x-bold" size="20" />
        <span>Delete Organization</span>
      </button>
    </section>

    <p v-if="errorMsg" class="text-sm text-danger px-2">
      {{ errorMsg }}
    </p>
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

const errorMsg = ref("")

async function handleLeaveOrganization() {
  errorMsg.value = ""
  if (!props.organization?.id || !userStore.user?.id) {
    errorMsg.value = "Missing organization or user ID."
    return
  }
  if (!confirm("Are you sure you want to leave this organization?"))
    return

  await organizationStore.removeOrganizationMember(userStore.user.id, props.organization.id)
  if (organizationStore.error) {
    errorMsg.value = organizationStore.error
    return
  }

  router.push("/setup/create-org")
}

async function handleDeleteOrganization() {
  errorMsg.value = ""
  if (!props.organization?.id) {
    errorMsg.value = "Organization ID is undefined."
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
    else {
      errorMsg.value = result?.message || "Failed to delete organization."
    }
  }
  catch (error: any) {
    errorMsg.value = error.message || "An error occurred while deleting the organization."
  }
}
</script>
