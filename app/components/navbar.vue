<template>
  <div class="navigation-group justify-between border-b-2 bg-card p-4">
    <div class="navigation-group">
      <nuxt-link to="/" class="hover:scale-sm flex flex-row items-center gap-2 transition-all">
        <img
          src="/assets/logo.png" alt="Logo"
          width="40" height="40"
          class="rounded-full"
        >
      </nuxt-link>

      <nav class="navigation-group text-sm" aria-label="Breadcrumbs Navigation">
        <div class="md:navigation-group hidden text-muted-foreground">
          <span>/</span>
          <span>{{ userStore.user?.name }}</span>
          <span>/</span>
        </div>

        <div ref="dropdownRef" class="relative">
          <button class="navigation-group truncate hover:underline" aria-label="Select Organization" @click="isDropdownOpen = !isDropdownOpen">
            <span class="text-muted-foreground">{{ orgStore.activeOrg?.name }}</span>
            <icon name="ph:caret-down-bold" size="20" class="hover:scale-md transition-all hover:text-accent" />
          </button>

          <transition name="dropdown" mode="out-in">
            <ul v-if="isDropdownOpen" class="dropdown scroll-area overflow-y-auto text-sm" role="menu" aria-label="User Organizations">
              <li
                v-for="org in orgs" :key="org.id"
                role="menuitem" class="truncate whitespace-nowrap rounded p-2 hover:bg-muted"
                :class="org.id === orgStore.activeOrg?.id ? 'bg-muted' : ''" @click="setActiveOrg(org)"
              >
                <span>{{ org.name }}</span>
              </li>
              <li class="group truncate rounded p-2 hover:bg-muted">
                <nuxt-link to="/setup/create-org" class="navigation-group">
                  <icon name="ph:plus-bold" size="20" class="group-hover:scale-md text-accent transition-all" />
                  <span>Create Organization</span>
                </nuxt-link>
              </li>
            </ul>
          </transition>
        </div>

        <div class="md:navigation-group hidden text-muted-foreground">
          <span>/</span>
          <span class="capitalize">{{ currentPage }}</span>
        </div>
      </nav>
    </div>

    <nav class="navigation-group" aria-label="User Actions">
      <button class="btn md:hidden" aria-label="Toggle Sidebar" @click="$emit('toggleSidebar')">
        <icon :name="props.isSidebarOpen ? 'ph:x' : 'ph:list'" size="20" />
      </button>
      <button class="btn" aria-label="Sign Out" @click="signOut">
        <icon name="ph:sign-out-bold" size="20" />
        <span class="hidden md:inline">Sign Out</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

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
  const found = orgStore.orgs.find(o => o.id === org.id)
  if (found) {
    orgStore.activeOrg = found
    localStorage.setItem("active_org_id", org.id)
  }
  isDropdownOpen.value = false
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
