<template>
  <Loading v-if="isLoading" />

  <div v-show="!isLoading" class="min-h-screen">
    <Navbar :orgs="orgs" :org="orgStore.activeOrg" :is-sidebar-open="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="flex flex-1">
      <Sidebar v-if="orgStore.activeOrg" :org="orgStore.activeOrg" :is-open="isSidebarOpen" @update:is-open="isSidebarOpen = $event" />
      <main class="flex flex-1 flex-col overflow-x-hidden p-4">
        <slot :active-org="orgStore.activeOrg" />
      </main>
    </div>
  </div>

  <Footer />
</template>

<script setup lang="ts">
const router = useRouter()
const userStore = useUserStore()
const orgStore = useOrganizationStore()
const projectsStore = useProjectsStore()

const isSidebarOpen = ref(false)
const isLoading = ref(true)

const orgs = computed(() =>
  userStore.user?.organizations
    ?.map(m => m.organization)
    .filter((org: unknown): org is OrganizationType => !!org) ?? [],
)

function initActiveOrg(user: UserType) {
  if (!user?.organizations?.length)
    return

  if (import.meta.client) {
    const orgFromStorage = localStorage.getItem("active_org_id")
    const matchedOrg = user.organizations.find(m => m.organization?.id === orgFromStorage)?.organization
    orgStore.activeOrg = matchedOrg || user.organizations[0]?.organization
    if (orgStore.activeOrg) {
      localStorage.setItem("active_org_id", orgStore.activeOrg.id)
    }
  }
  else {
    orgStore.activeOrg = user.organizations[0]?.organization
  }
}

async function getGlobalData() {
  try {
    const [user] = await Promise.all([
      userStore.getUser(),
      projectsStore.getProjects(),
    ])
    if (!user?.organizations?.length) {
      await router.replace("/setup/create-org")
      return
    }

    orgStore.orgs = user.organizations
      .map((m: OrganizationMembershipType) => m.organization)
      .filter((org: OrganizationType | undefined | null): org is OrganizationType => !!org)

    initActiveOrg(user)
  }
  catch (error: any) {
    console.error("Failed to load global data:", error)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (document.readyState === "complete") {
    getGlobalData()
  }
  else {
    window.addEventListener("load", getGlobalData)
  }
})
</script>
