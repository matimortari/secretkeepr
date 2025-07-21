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
        <Sidebar :organization="activeOrganization" :is-open="isSidebarOpen" @update:is-open="isSidebarOpen = $event" />
        <main class="relative flex-1 overflow-x-hidden p-8">
          <slot :active-organization="activeOrganization" />
        </main>
      </div>
    </div>

    <footer class="py-4 text-center text-sm md:p-8">
      <p>© {{ new Date().getFullYear() }} – SecretKeepR</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const { data: session, status } = useAuth()
const router = useRouter()
const userStore = useUserStore()
const organizationStore = useOrganizationStore()

const isLoading = ref(true)
const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

const organizations = computed(() =>
  (userStore.user?.memberships?.map(m => m.organization).filter((org): org is OrganizationType => !!org)) ?? [],
)

const activeOrganization = computed(() => organizationStore.selectedOrganization)

function onUpdateActiveOrganization(org: OrganizationType) {
  organizationStore.setSelectedOrganization(org.id)
  userStore.setSelectedOrganization(org)
}

function initSelectedOrganization() {
  organizationStore.organizations = organizations.value

  const storedId = localStorage.getItem("active_org_id")
  const match = organizationStore.organizations.find(org => org.id === storedId)

  if (match) {
    organizationStore.setSelectedOrganization(match.id)
    userStore.setSelectedOrganization(match)
  }
  else if (organizationStore.organizations.length) {
    const firstOrg = organizationStore.organizations[0]
    organizationStore.setSelectedOrganization(firstOrg.id)
    userStore.setSelectedOrganization(firstOrg)
  }
}

watch(() => organizationStore.selectedOrganization, (org) => {
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

  initSelectedOrganization()
  isLoading.value = false
})
</script>
