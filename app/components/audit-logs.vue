<template>
  <section class="flex flex-col items-start justify-between gap-2 border-b p-2">
    <header class="flex flex-col items-start gap-1 text-start">
      <h4>
        Audit Logs
      </h4>
      <p class="text-info">
        Track changes and activities.
      </p>
    </header>

    <div class="flex w-full flex-row gap-2 overflow-auto md:items-center md:justify-between">
      <nav class="navigation-group">
        <input
          v-model="filters.date" type="date"
          title="Filter by date" class="cursor-pointer appearance-none rounded border border-muted bg-transparent p-2 focus:outline-none"
        >

        <div ref="userDropdownRef" class="relative">
          <button class="btn" title="Filter by user" @click="isUserDropdownOpen = !isUserDropdownOpen">
            <span class="capitalize">{{ filters.user || 'All Users' }}</span>
            <Icon name="ph:caret-down-bold" size="15" />
          </button>
          <Transition name="dropdown">
            <ul v-if="isUserDropdownOpen" class="dropdown scroll-area overflow-y-auto whitespace-nowrap text-sm">
              <li class="rounded p-2 hover:bg-muted" @click="setUserFilter('')">
                All Users
              </li>
              <li class="rounded p-2 hover:bg-muted" @click="setUserFilter('self')">
                Self
              </li>
              <li v-for="user in users" :key="user" class="rounded p-2 hover:bg-muted" @click="setUserFilter(user)">
                {{ user }}
              </li>
            </ul>
          </Transition>
        </div>

        <div ref="actionDropdownRef" class="relative">
          <button class="btn" title="Filter by action" @click="isActionDropdownOpen = !isActionDropdownOpen">
            <span>{{ actions.find(a => a.value === filters.action)?.label || 'All Actions' }}</span>
            <Icon name="ph:caret-down-bold" size="15" />
          </button>
          <Transition name="dropdown">
            <ul v-if="isActionDropdownOpen" class="dropdown scroll-area overflow-y-auto whitespace-nowrap text-sm">
              <li class="rounded p-2 hover:bg-muted" @click="setActionFilter('')">
                All Actions
              </li>
              <li v-for="action in actions" :key="action.value" class="rounded p-2 hover:bg-muted" @click="setActionFilter(action.value)">
                {{ action.label }}
              </li>
            </ul>
          </Transition>
        </div>

        <button
          class="btn" :title="filters.showSensitiveInfo ? 'Hide Sensitive Info' : 'Show Sensitive Info'"
          @click="filters.showSensitiveInfo = !filters.showSensitiveInfo"
        >
          <Icon :name="filters.showSensitiveInfo ? 'ph:eye-slash-bold' : 'ph:eye-bold'" size="20" />
        </button>
      </nav>

      <nav v-if="orgStore.totalPages > 0" class="navigation-group">
        <button
          type="button" class="btn-secondary disabled:opacity-80"
          :disabled="!orgStore.hasPrevPage" title="Previous Page"
          @click="orgStore.prevAuditLogPage"
        >
          <Icon name="ph:arrow-left-bold" size="20" />
        </button>

        <span class="text-info whitespace-nowrap">
          {{ orgStore.auditLogs.page }} / {{ orgStore.totalPages }}
        </span>
        <button
          type="button" class="btn-secondary disabled:opacity-80"
          :disabled="!orgStore.hasNextPage" title="Next Page"
          @click="orgStore.nextAuditLogPage"
        >
          <Icon name="ph:arrow-right-bold" size="20" />
        </button>
        <button
          type="button" class="btn-danger"
          :disabled="!logs.length" title="Delete Filtered Logs"
          @click="handleDeleteLogs"
        >
          <Icon name="ph:trash-bold" size="20" />
        </button>
      </nav>
    </div>

    <p v-if="orgStore.isLoading" class="text-info h-[50vh] py-4">
      Loading logs...
    </p>
    <p v-else-if="!logs.length" class="text-info h-[50vh] py-4">
      No audit logs found.
    </p>

    <div v-else class="scroll-area max-h-[50vh] w-full overflow-x-auto">
      <table class="min-w-full table-auto rounded-sm md:w-full md:overflow-hidden">
        <thead>
          <tr class="truncate bg-muted text-sm font-semibold">
            <th v-for="header in headers" :key="header.value" class="border p-2">
              <div class="navigation-group">
                <Icon :name="header.icon" size="20" />
                <span>{{ header.label }}</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td class="max-w-sm truncate border p-2 text-sm font-medium md:max-w-40" :title="actions.find(a => a.value === log.action)?.label">
              {{ actions.find(a => a.value === log.action)?.label }}
            </td>
            <td class="text-info max-w-sm truncate border p-2 md:max-w-32" :title="log.resource">
              {{ log.resource }}
            </td>
            <td class="text-info max-w-md truncate border p-2 md:max-w-60" :title="formatMetadata(log.metadata ?? {})">
              {{ formatMetadata(log.metadata ?? {}) }}
            </td>
            <td class="text-info max-w-sm truncate border p-2 md:max-w-32" :title="log.userId">
              <span>{{ log.userId }}</span>
            </td>
            <td class="text-info max-w-sm truncate border p-2 md:max-w-32" :title="formatDate(log.createdAt)">
              {{ formatDate(log.createdAt) }}
            </td>
            <td class="text-info max-w-sm truncate border p-2 md:max-w-32" :title="filters.showSensitiveInfo ? formatSensitiveInfo(log.metadata ?? {}) : ''">
              <span v-if="filters.showSensitiveInfo">
                {{ formatSensitiveInfo(log.metadata ?? {}) }}
              </span>
              <span v-else class="text-muted">Hidden</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"

const orgStore = useOrganizationStore()
const { filters, actions, headers, logs, formatDate, formatMetadata, formatSensitiveInfo } = useAuditLogs()

const users = computed(() =>
  [...new Set(orgStore.auditLogs.logs.map(log => log.userId))].sort((a, b) => a.localeCompare(b)),
)

const isUserDropdownOpen = ref(false)
const isActionDropdownOpen = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)
const actionDropdownRef = ref<HTMLElement | null>(null)

useClickOutside(userDropdownRef, () => {
  isUserDropdownOpen.value = false
}, { escapeKey: true })

useClickOutside(actionDropdownRef, () => {
  isActionDropdownOpen.value = false
}, { escapeKey: true })

function setUserFilter(user: string) {
  filters.value.user = user
  isUserDropdownOpen.value = false
}

function setActionFilter(action: string) {
  filters.value.action = action
  isActionDropdownOpen.value = false
}

async function handleDeleteLogs() {
  if (!orgStore.activeOrg?.id)
    return
  if (!confirm("Are you sure you want to delete all filtered audit logs? This action cannot be undone."))
    return

  const deleteFilters = {
    orgId: orgStore.activeOrg.id,
    action: filters.value.action || undefined,
    beforeDate: filters.value.date || undefined,
    createdBySelfOnly: filters.value.user === "self",
    protectedActions: [],
  }

  try {
    await orgStore.deleteAuditLogs(deleteFilters)
  }
  catch (error: any) {
    console.error("Failed to delete audit logs:", error)
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

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
}
</style>
