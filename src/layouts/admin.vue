<template>
  <Loading v-if="isLoading" />

  <div v-show="!isLoading" class="flex flex-col">
    <Navbar
      :orgs="orgs"
      :org="activeOrg"
      :is-sidebar-open="isSidebarOpen"
      @toggle-sidebar="toggleSidebar"
    />

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
import { useRouter } from "vue-router"
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const { data: session, status } = useAuth()
const router = useRouter()
const userStore = useUserStore()
const orgStore = useOrganizationStore()

const isLoading = ref(true)
const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

const orgs = computed(() =>
  userStore.user?.memberships
    ?.map(m => m.organization)
    .filter((org): org is OrganizationType => !!org) ?? [],
)

const activeOrg = computed(() => orgStore.selectedOrg)

watch(() => orgStore.selectedOrg?.id, (id) => {
  if (id)
    localStorage.setItem("active_org_id", id)
})

onMounted(async () => {
  if (status.value !== "authenticated" || !session.value?.user) {
    isLoading.value = false
    return
  }

  await userStore.getUser()
  if (!userStore.user?.memberships?.length) {
    return router.replace("/setup/create-org")
  }

  orgStore.orgs = orgs.value
  const currentOrg = userStore.selectedOrg
  if (currentOrg) {
    orgStore.setSelectedOrg(currentOrg.id)
  }

  isLoading.value = false
})
</script>
