<template>
  <Loading v-if="isLoading" />

  <div v-show="!isLoading" class="min-h-screen">
    <Navbar :orgs="orgs" :org="user.activeOrgId" :is-sidebar-open="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="flex flex-1 pb-8">
      <Sidebar v-if="user.activeOrgId" :org="orgs.find(o => o.id === user.activeOrgId)" :is-open="isSidebarOpen" @update:is-open="isSidebarOpen = $event" />
      <main class="flex flex-1 flex-col overflow-x-hidden p-4">
        <slot :active-org="user.activeOrgId" />
      </main>
    </div>
  </div>

  <Footer />
</template>

<script setup lang="ts">
const userStore = useUserStore()
const projectStore = useProjectStore()
const organizationStore = useOrganizationStore()

const isSidebarOpen = ref(false)
const isLoading = ref(true)

const user = computed(() => userStore.user || { activeOrgId: null })
const orgs = computed(() => userStore.organizations || [])

async function getUserData() {
  try {
    await Promise.all([
      userStore.getUser(),
    ])
    if (userStore.user?.activeOrgId) {
      await organizationStore.getOrg(userStore.user.activeOrgId)
      await projectStore.getProjects()
    }
    else {
      await navigateTo("/onboarding/create-org")
    }
  }
  catch (err: any) {
    console.error("Failed to load user data:", err)
    await navigateTo("/sign-in")
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (document.readyState === "complete") {
    getUserData()
  }
  else {
    window.addEventListener("load", getUserData)
  }
})
</script>
