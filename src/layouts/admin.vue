<template>
  <Loading v-if="isLoading" />

  <div v-show="!isLoading" class="flex flex-col">
    <Navbar
      :orgs="orgs"
      :model-value="activeOrg"
      :is-sidebar-open="isSidebarOpen"
      @update:model-value="onUpdateActiveOrg"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="flex flex-1">
      <Sidebar :org="activeOrg" :is-open="isSidebarOpen" @update:is-open="isSidebarOpen = $event" />

      <main class="min-h-screen flex-1 overflow-x-hidden p-8">
        <slot :active-org="activeOrg" />
      </main>
    </div>
  </div>

  <footer class="py-4 text-center text-sm md:p-8">
    <p>© {{ new Date().getFullYear() }} – SecretKeepR</p>
  </footer>
</template>

<script setup lang="ts">
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
  (userStore.user?.memberships?.map(m => m.organization).filter((org): org is OrganizationType => !!org)) ?? [],
)

const activeOrg = computed(() => orgStore.selectedOrg)

function onUpdateActiveOrg(org: OrganizationType) {
  orgStore.setSelectedOrg(org.id)
  userStore.setSelectedOrg(org)
}

function initSelectedOrg() {
  orgStore.orgs = orgs.value

  const storedId = localStorage.getItem("active_org_id")
  const match = orgStore.orgs.find(org => org.id === storedId)

  if (match) {
    orgStore.setSelectedOrg(match.id)
    userStore.setSelectedOrg(match)
  }
  else if (orgStore.orgs.length) {
    const firstOrg = orgStore.orgs[0]
    orgStore.setSelectedOrg(firstOrg.id)
    userStore.setSelectedOrg(firstOrg)
  }
}

watch(() => orgStore.selectedOrg, (org) => {
  if (org?.id) {
    localStorage.setItem("active_org_id", org.id)
  }
})

onMounted(async () => {
  if (status.value !== "authenticated" || !session.value?.user) {
    isLoading.value = false
    return
  }

  await userStore.getUser()
  if (!userStore.user?.memberships?.length) {
    router.replace("/setup/create-org")
    return
  }

  initSelectedOrg()
  isLoading.value = false
})
</script>
