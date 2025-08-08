<template>
  <Loading v-if="isLoading" />

  <div v-show="!isLoading" class="min-h-screen">
    <Navbar :orgs="orgs" :org="orgStore.activeOrg" :is-sidebar-open="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="flex flex-1">
      <Sidebar :org="orgStore.activeOrg" :is-open="isSidebarOpen" @update:is-open="isSidebarOpen = $event" />
      <main class="flex flex-1 flex-col overflow-x-hidden p-4">
        <slot :active-org="orgStore.activeOrg" />
      </main>
    </div>
  </div>

  <Footer />
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const router = useRouter()
const userStore = useUserStore()
const orgStore = useOrganizationStore()

const isSidebarOpen = ref(false)
const isLoading = ref(true)

const orgs = computed(() =>
  userStore.user?.memberships
    ?.map(m => m.organization)
    .filter((org): org is OrganizationType => !!org) ?? [],
)

function initActiveOrg(user: UserType) {
  if (!user?.memberships?.length)
    return
  if (import.meta.client) {
    const orgFromStorage = localStorage.getItem("active_org_id")
    const matchedOrg = user.memberships.find(m => m.organization?.id === orgFromStorage)?.organization
    orgStore.activeOrg = matchedOrg || user.memberships[0]?.organization || null
    if (orgStore.activeOrg) {
      localStorage.setItem("active_org_id", orgStore.activeOrg.id)
    }
  }
  else {
    orgStore.activeOrg = user.memberships[0]?.organization || null
  }
}

onMounted(async () => {
  const user = await userStore.getUser()
  if (!user?.memberships?.length) {
    return router.replace("/setup/create-org")
  }
  orgStore.orgs = user.memberships.map(m => m.organization).filter((org): org is OrganizationType => !!org)
  initActiveOrg(user)
  isLoading.value = false
})
</script>
