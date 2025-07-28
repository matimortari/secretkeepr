<template>
  <div class="navigation-group justify-between border-b-2 p-4">
    <div class="navigation-group">
      <NuxtLink to="/" class="hover:scale-sm flex flex-row items-center gap-2 transition-all">
        <img
          src="/logo.png" alt="Logo"
          width="40" height="40"
          class="rounded-full"
        >
        <span class="hidden text-xl font-semibold md:inline">SecretKeepR</span>
      </NuxtLink>

      <nav class="navigation-group text-sm">
        <div class="md:navigation-group hidden text-muted-foreground">
          <span>/</span>
          <span>{{ userStore.user?.name }}</span>
          <span>/</span>
        </div>

        <div ref="dropdownRef" class="relative">
          <button class="navigation-group truncate hover:underline" @click="isDropdownOpen = !isDropdownOpen">
            <span class="text-muted-foreground">{{ selectedOrg?.name }}</span>
            <Icon name="ph:caret-down-bold" size="20" class="hover:scale-md transition-all hover:text-accent" />
          </button>

          <Transition name="dropdown" mode="out-in">
            <ul v-if="isDropdownOpen" class="dropdown scroll-area overflow-y-auto">
              <li
                v-for="org in orgs" :key="org.id"
                class="cursor-pointer truncate rounded p-2 hover:bg-muted" role="option"
                @click="selectOrg(org)"
              >
                {{ org.name }}
              </li>
              <li class="group truncate rounded p-2 hover:bg-muted" role="option">
                <NuxtLink to="/setup/create-org" class="navigation-group">
                  <span class="font-semibold text-accent group-hover:text-muted-foreground">Create New</span>
                  <Icon name="ph:plus-bold" size="20" class="text-accent group-hover:text-muted-foreground" />
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </div>

        <div class="md:navigation-group hidden text-muted-foreground">
          <span>/</span>
          <span class="capitalize">{{ currentPage }}</span>
        </div>
      </nav>
    </div>

    <nav class="navigation-group">
      <button class="btn md:hidden" @click="$emit('toggleSidebar')">
        <Icon :name="props.isSidebarOpen ? 'ph:x' : 'ph:list'" size="20" />
      </button>
      <button class="btn" @click="toggleTheme">
        <Icon :name="themeIcon" size="20" />
      </button>
      <button class="btn" @click="() => signOut({ callbackUrl: '/' })">
        <Icon name="ph:sign-out-bold" size="20" />
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

defineEmits<{
  (e: "toggleSidebar"): void
}>()

const { themeIcon, toggleTheme } = useTheme()
const { signOut } = useAuth()
const route = useRoute()
const orgStore = useOrganizationStore()
const userStore = useUserStore()
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

useClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false
}, { escapeKey: true })

const currentPage = computed(() => {
  const segments = route.path.split("/").filter(Boolean)
  return segments.length ? segments[segments.length - 1] : "home"
})

const selectedOrg = computed(() => orgStore.selectedOrg)

function selectOrg(org: OrganizationType) {
  orgStore.setSelectedOrg(org.id)
  isDropdownOpen.value = false
  window.location.reload()
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
