<template>
  <div v-if="userStore.user" class="navigation-group bg-card justify-between border-b-2 p-4">
    <div class="navigation-group">
      <nuxt-link to="/" class="hover:scale-sm flex flex-row items-center gap-2 transition-all">
        <img src="/assets/logo-icon.png" alt="Logo" width="35" height="35">
      </nuxt-link>

      <nav class="navigation-group text-sm" aria-label="Breadcrumbs Navigation">
        <div class="md:navigation-group text-muted-foreground hidden">
          <span>/</span>
          <span>{{ userStore.user.name }}</span>
          <span>/</span>
        </div>

        <div ref="dropdownRef" class="relative">
          <button class="navigation-group truncate hover:underline" aria-label="Select Organization" @click="isDropdownOpen = !isDropdownOpen">
            <span class="text-muted-foreground">{{ orgStore.activeOrg?.name }}</span>
            <icon name="ph:caret-down-bold" size="20" class="hover:scale-md hover:text-accent transition-all" />
          </button>

          <transition name="dropdown" mode="out-in">
            <ul v-if="isDropdownOpen" class="dropdown scroll-area overflow-y-auto text-sm" role="menu" aria-label="User Organizations">
              <li
                v-for="org in orgs" :key="org.id"
                role="menuitem" class="hover:bg-muted truncate rounded p-2 whitespace-nowrap"
                :class="org.id === orgStore.activeOrg?.id ? 'bg-muted' : ''" @click="setActiveOrg(org)"
              >
                <span>{{ org.name }}</span>
              </li>
              <li class="group hover:bg-muted truncate rounded p-2">
                <nuxt-link to="/setup/create-org" class="navigation-group">
                  <icon name="ph:plus-bold" size="20" class="group-hover:scale-md text-accent transition-all" />
                  <span>Create Organization</span>
                </nuxt-link>
              </li>
            </ul>
          </transition>
        </div>

        <div class="md:navigation-group text-muted-foreground hidden">
          <span>/</span>
          <span class="capitalize">{{ currentPage }}</span>
        </div>
      </nav>
    </div>

    <nav class="navigation-group" aria-label="User Actions">
      <nuxt-link to="/admin/preferences" title="User Preferences" aria-label="User Preferences">
        <img :src="userStore.user.image ?? undefined" alt="Avatar" class="size-10 rounded-full border-2">
      </nuxt-link>
      <button class="btn md:!hidden" aria-label="Toggle Sidebar" @click="$emit('toggleSidebar')">
        <icon :name="props.isSidebarOpen ? 'ph:x' : 'ph:list'" size="20" />
      </button>
      <button class="btn" aria-label="Sign Out" @click="signOut">
        <icon name="ph:sign-out-bold" size="20" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  orgs: OrganizationType[]
  isSidebarOpen: boolean
}>()

defineEmits<(e: "toggleSidebar") => void>()

const route = useRoute()
const { clear } = useUserSession()
const orgStore = useOrganizationStore()
const userStore = useUserStore()

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

useClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false
}, { escapeKey: true })

const currentPage = computed(() => {
  const segments = route.path.split("/").filter(Boolean)
  let page = segments.length ? segments[segments.length - 1] : "home"
  page = (page ?? "home").replace(/-/g, " ")
  return page.replace(/\b\w/g, l => l.toUpperCase())
})

async function setActiveOrg(org: OrganizationType) {
  try {
    await setActiveOrgService(org.id)
    orgStore.activeOrg = org
  }
  catch (error: any) {
    error.value = error.message || "Failed to switch organization"
    throw error
  }
}

function signOut() {
  clear()
  window.location.href = "/"
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(0.25rem);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
