<template>
  <nav class="navigation-group justify-between p-4 border-b-2">
    <div class="navigation-group">
      <NuxtLink to="/">
        <img
          src="/logo.png" alt="Logo"
          width="40" height="40"
          class="flex-shrink-0"
        >
      </NuxtLink>

      <div class="navigation-group text-sm">
        <div class="hidden md:navigation-group text-muted-foreground">
          <span>/</span>
          <span>{{ user?.name }}</span>
          <span>/</span>
        </div>

        <div ref="dropdownRef" class="relative">
          <button class="navigation-group truncate hover:underline" @click="isDropdownOpen = !isDropdownOpen">
            <span class="text-muted-foreground">{{ selectedOrganization?.name || 'Select Organization' }}</span>
            <Icon name="ph:caret-down-bold" size="20" class="hover:scale-md hover:text-accent transition-all duration-500" />
          </button>

          <Transition name="dropdown" mode="out-in">
            <ul v-if="isDropdownOpen" class="dropdown overflow-y-auto scroll-area">
              <li
                v-for="org in organizations" :key="org.id"
                class="p-2 hover:bg-muted rounded cursor-pointer truncate" role="option"
                @click="selectOrganization(org)"
              >
                {{ org.name }}
              </li>
              <li class="p-2 hover:bg-muted rounded truncate group" role="option">
                <NuxtLink to="/setup/create-org" class="navigation-group">
                  <span class="text-accent group-hover:text-muted-foreground font-semibold">Create New</span>
                  <Icon name="ph:plus-bold" size="20" class="text-accent group-hover:text-muted-foreground" />
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </div>

        <div class="hidden md:navigation-group text-muted-foreground">
          <span>/</span>
          <span class="capitalize">{{ currentPage }}</span>
        </div>
      </div>
    </div>

    <div class="navigation-group">
      <button class="btn" @click="() => signOut({ callbackUrl: '/' })">
        <Icon name="ph:sign-out-bold" size="20" />
        <span>Sign Out</span>
      </button>
      <button class="btn" @click="toggleTheme">
        <Icon :name="themeIcon" size="20" />
      </button>
      <button class="btn md:hidden" @click="$emit('toggleSidebar')">
        <Icon :name="props.isSidebarOpen ? 'ph:x' : 'ph:list'" size="20" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  organizations: OrganizationType[]
  modelValue: OrganizationType | null
  isSidebarOpen: boolean
}>()

defineEmits<{
  (e: "toggleSidebar"): void
}>()

const { themeIcon, toggleTheme } = useTheme()
const { signOut } = useAuth()
const route = useRoute()
const userStore = useUserStore()

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

useClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false
}, { escapeKey: true })

const user = computed(() => userStore.user)

const currentPage = computed(() => {
  const path = route.path.split("/").filter(Boolean)
  return path.length > 0 ? path[path.length - 1] : "home"
})

const selectedId = computed({
  get: () => userStore.selectedOrganization?.id,
  set: (newId: string) => {
    const org = props.organizations.find(o => o.id === newId)
    if (org) {
      userStore.setSelectedOrganization(org)
      window.location.reload()
    }
  },
})

const selectedOrganization = computed(() =>
  props.organizations.find(o => o.id === selectedId.value),
)

function selectOrganization(org: OrganizationType) {
  userStore.setSelectedOrganization(org)
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
