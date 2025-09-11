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
  orgStore.activeOrg = user.organizations[0]?.organization
}

async function getGlobalData() {
  try {
    await Promise.all([
      userStore.getUser(),
      projectsStore.getProjects(),
    ])
    if (!userStore.user?.organizations?.length) {
      await router.replace("/setup/create-org")
      return
    }

    orgStore.orgs = userStore.user.organizations.map(m => m.organization).filter((org): org is OrganizationType => !!org)
    initActiveOrg(userStore.user)
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
