<template>
  <div class="flex flex-col gap-2 border-b">
    <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
      <h4>
        Danger Zone
      </h4>
      <p class="text-sm text-muted-foreground">
        Manage critical actions related to the organization.
      </p>
    </header>

    <section class="flex flex-col md:flex-row md:items-center md:justify-between px-2 pb-2 border-b">
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

    <section class="flex flex-col md:flex-row md:items-center md:justify-between px-2 pb-2">
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
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  organization: OrganizationType | null
}>()

const router = useRouter()

async function handleLeaveOrganization() {
  const userId = useUserStore().user?.id
  if (!props.organization?.id || !userId) {
    console.error("Missing organization or user ID")
    return
  }
  // eslint-disable-next-line no-alert
  if (!confirm("Are you sure you want to leave this organization?"))
    return

  const result = await useOrganizationStore().removeOrganizationMember(userId, props.organization.id) as unknown as { message: string } | null

  if (result?.message === "You have left the organization") {
    router.push("/setup/create-org")
  }
  else if (result?.message?.includes("Owners cannot leave")) {
    // eslint-disable-next-line no-alert
    alert("As the owner, you cannot leave the organization. Please delete it instead.")
  }
  else {
    console.error("Failed to leave organization:", result?.message || "Unknown error")
  }
}

async function handleDeleteOrganization() {
  // eslint-disable-next-line no-alert
  if (!confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
    return
  }
  if (!props.organization?.id) {
    console.error("Organization ID is undefined.")
    return
  }

  const result = await useOrganizationStore().deleteOrganization(props.organization.id)
  if (result?.message === "Organization deleted successfully") {
    router.push("/setup/create-org")
  }
  else {
    console.error("Failed to delete organization:", result?.message || "Unknown error")
  }
}
</script>
