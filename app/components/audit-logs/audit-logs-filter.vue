<template>
  <div class="md:navigation-group flex flex-col items-start justify-between gap-2 border-b p-2">
    <nav class="navigation-group" aria-label="Filters">
      <input v-model="filters.date" type="date" title="Filter by date" class="hidden md:block">

      <div ref="userDropdownRef" class="relative">
        <button class="btn" title="Filter by user" @click="isUserDropdownOpen = !isUserDropdownOpen">
          <span class="capitalize">{{ userMap.get(filters.user) || 'All Users' }}</span>
          <icon name="ph:caret-down-bold" size="15" />
        </button>
        <transition name="dropdown">
          <ul v-if="isUserDropdownOpen" class="dropdown scroll-area overflow-y-auto text-sm whitespace-nowrap">
            <li class="hover:bg-muted rounded p-2" @click="setUserFilter('')">
              All Users
            </li>
            <li v-for="userId in users" :key="userId" class="hover:bg-muted flex items-center gap-1 rounded p-2" @click="setUserFilter(userId)">
              <span>{{ userMap.get(userId) || userId }}</span>
            </li>
          </ul>
        </transition>
      </div>

      <div ref="actionDropdownRef" class="relative">
        <button class="btn" title="Filter by action" @click="isActionDropdownOpen = !isActionDropdownOpen">
          <span>{{ actions.find(a => a.value === filters.action)?.label || 'All Actions' }}</span>
          <icon name="ph:caret-down-bold" size="15" />
        </button>
        <transition name="dropdown">
          <ul v-if="isActionDropdownOpen" class="dropdown scroll-area -left-8 overflow-y-auto text-sm whitespace-nowrap">
            <li class="hover:bg-muted rounded p-2" @click="setActionFilter('')">
              All Actions
            </li>
            <li v-for="action in actions" :key="action.value" class="hover:bg-muted rounded p-2" @click="setActionFilter(action.value)">
              {{ action.label }}
            </li>
          </ul>
        </transition>
      </div>

      <button class="btn" title="Show/Hide Sensitive Info" @click="filters.showSensitiveInfo = !filters.showSensitiveInfo">
        <icon :name="filters.showSensitiveInfo ? 'ph:eye-slash-bold' : 'ph:eye-bold'" size="20" />
      </button>
    </nav>

    <nav v-if="orgStore.totalPages > 0" class="navigation-group" aria-label="Pagination">
      <input v-model="filters.date" type="date" class="md:hidden" title="Filter by date">

      <button class="btn-secondary" :disabled="!orgStore.hasPrevPage" title="Previous Page" @click="orgStore.prevAuditLogPage">
        <icon name="ph:arrow-left-bold" size="20" />
      </button>
      <div class="text-caption flex flex-col items-center justify-center gap-1 whitespace-nowrap md:mx-4">
        <span>{{ orgStore.auditLogs.page }} / {{ orgStore.totalPages }}</span>
        <span v-if="logs.length" class="text-xs italic">{{ logsSummary }}</span>
      </div>
      <button class="btn-secondary" :disabled="!orgStore.hasNextPage" title="Next Page" @click="orgStore.nextAuditLogPage">
        <icon name="ph:arrow-right-bold" size="20" />
      </button>

      <button class="btn-danger" :disabled="!logs.length" title="Delete Logs" @click="handleDeleteLogs">
        <icon name="ph:trash-bold" size="20" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  filters: any
  actions: any[]
  logs: any[]
  userMap: Map<string, string>
}>()

const { filters, actions, logs, userMap } = toRefs(props)

const orgStore = useOrganizationStore()
const activeOrg = computed(() => orgStore.activeOrg as OrganizationType)

const users = computed(() => {
  const userSet = new Set<string>()
  orgStore.auditLogs.logs.forEach(l => l.userId && userSet.add(l.userId))
  return [...userSet].sort()
})

const isUserDropdownOpen = ref(false)
const isActionDropdownOpen = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)
const actionDropdownRef = ref<HTMLElement | null>(null)

useClickOutside(userDropdownRef, () => isUserDropdownOpen.value = false, { escapeKey: true })
useClickOutside(actionDropdownRef, () => isActionDropdownOpen.value = false, { escapeKey: true })

function setUserFilter(user: string) {
  filters.value.user = user
  isUserDropdownOpen.value = false
}
function setActionFilter(action: string) {
  filters.value.action = action
  isActionDropdownOpen.value = false
}

const logsSummary = computed(() => {
  const count = logs.value.length
  return count ? `${count} ${count === 1 ? "log" : "logs"}` : "no matching logs"
})

async function handleDeleteLogs() {
  if (!activeOrg.value.id)
    return
  if (!confirm(`Are you sure you want to delete ${logsSummary.value}? This action cannot be undone.`))
    return

  const deleteFilters = {
    orgId: activeOrg.value.id,
    action: filters.value.action,
    beforeDate: filters.value.date,
    createdBySelfOnly: filters.value.user === "self",
    protectedActions: [],
  }
  try {
    await orgStore.deleteAuditLogs(deleteFilters)
  }
  catch (error: any) {
    console.error(error)
    orgStore.error = error.message
  }
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
input[type="date"] {
  padding: 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  color: var(--muted-foreground);
  color-scheme: dark;
}
input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-clear-button {
  display: none;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
  cursor: pointer;
}
</style>
