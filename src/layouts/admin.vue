<template>
  <Loading v-if="isLoading" />

  <div v-show="!isLoading" class="flex flex-col">
    <Navbar :orgs="orgs" :org="activeOrg" :is-sidebar-open="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <div class="flex flex-1">
      <Sidebar :org="activeOrg" :is-open="isSidebarOpen" @update:is-open="isSidebarOpen = $event" />
      <main class="min-h-screen flex-1 overflow-x-hidden p-4">
        <slot :active-org="activeOrg" />
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

const activeOrg = computed(() => orgStore.selectedOrg)

onMounted(async () => {
  await userStore.getUser()
  if (!userStore.user?.memberships?.length) {
    return router.replace("/setup/create-org")
  }

  orgStore.orgs = orgs.value
  const currentOrg = orgStore.selectedOrg
  if (currentOrg) {
    orgStore.setSelectedOrg(currentOrg.id)
  }

  isLoading.value = false
})

watch(() => orgStore.selectedOrg?.id, (id) => {
  if (id)
    localStorage.setItem("active_org_id", id)
})
</script>
