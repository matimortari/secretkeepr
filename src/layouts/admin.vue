<template>
  <div class="flex flex-col">
    <div v-if="isLoading">
      <Loading />
    </div>

    <div v-show="!isLoading" class="flex flex-col">
      <Navbar
        :organizations="organizations"
        :model-value="activeOrganization"
        :is-sidebar-open="isSidebarOpen"
        @update:model-value="onUpdateActiveOrganization"
        @toggle-sidebar="toggleSidebar"
      />

      <div class="flex flex-1">
        <Sidebar :organization="activeOrganization" :is-open="isSidebarOpen" />
        <main class="flex-1 overflow-x-hidden relative p-8">
          <slot :active-organization="activeOrganization" />
        </main>
      </div>
    </div>

    <footer class="py-4 text-center text-sm">
      <p>© {{ new Date().getFullYear() }} – SecretKeepR</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const router = useRouter()
const { data: session, status } = useAuth()

const isLoading = ref(true)
const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

const organizations = computed(() =>
  (useUserStore().user?.memberships?.map(m => m.organization).filter((org): org is OrganizationType => !!org)) ?? [],
)

const activeOrganization = computed(() => useOrganizationStore().selectedOrganization)

function onUpdateActiveOrganization(org: OrganizationType) {
  useOrganizationStore().setSelectedOrganization(org.id)
  useUserStore().setSelectedOrganization(org)
}

function initSelectedOrganization() {
  useOrganizationStore().organizations = organizations.value

  const storedId = localStorage.getItem("active_org_id")
  const match = useOrganizationStore().organizations.find(org => org.id === storedId)

  if (match) {
    useOrganizationStore().setSelectedOrganization(match.id)
    useUserStore().setSelectedOrganization(match)
  }
  else if (useOrganizationStore().organizations.length) {
    const firstOrg = useOrganizationStore().organizations[0]
    useOrganizationStore().setSelectedOrganization(firstOrg.id)
    useUserStore().setSelectedOrganization(firstOrg)
  }
}

onMounted(async () => {
  if (status.value !== "authenticated" || !session.value?.user)
    return

  await useUserStore().getUser()
  if (!useUserStore().user?.memberships?.length) {
    router.replace("/setup/create-org")
    return
  }

  initSelectedOrganization()
  isLoading.value = false
})
</script>
