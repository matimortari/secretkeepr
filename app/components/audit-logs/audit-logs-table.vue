<template>
  <div class="scroll-area w-full overflow-x-auto">
    <table class="bg-card min-w-full table-auto rounded-t-lg border md:w-full md:overflow-hidden">
      <thead>
        <tr class="bg-muted text-sm font-semibold">
          <th v-for="header in headers" :key="header.value" class="border-x text-start">
            <div class="navigation-group truncate p-2">
              <icon :name="header.icon" size="20" />
              <span>{{ header.label }}</span>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="log in logs" :key="log.id" class="hover:bg-muted border text-sm">
          <td class="max-w-sm truncate border p-2 md:max-w-24" :title="actions.find(a => a.value === log.action)?.label">
            {{ actions.find(a => a.value === log.action)?.label }}
          </td>
          <td class="text-caption max-w-sm truncate border p-2 md:max-w-28" :title="log.resource">
            {{ log.resource }}
          </td>
          <td class="text-caption max-w-md truncate border p-2 md:max-w-60" :title="plainMetadata(log.metadata)">
            <span v-html="formatMetadata(log.metadata)" />
          </td>
          <td class="text-caption max-w-sm truncate border p-2 md:max-w-24" :title="userMap.get(log.userId)">
            {{ userMap.get(log.userId) }}
          </td>
          <td class="text-caption max-w-sm truncate border p-2 md:max-w-32" :title="formatDate(log.createdAt)">
            {{ formatDate(log.createdAt) }}
          </td>
          <td class="text-caption max-w-sm truncate border p-2 md:max-w-24" :title="filters.showSensitiveInfo ? formatSensitiveData(log.metadata, 1000) : 'Hidden'">
            <span v-if="filters.showSensitiveInfo" v-html="formatSensitiveData(log.metadata, 1000)" />
            <span v-else>Hidden</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  logs: any[]
  headers: any[]
  actions: any[]
  filters: any
  userMap: Map<string, string>
}>()

const { formatDate, formatMetadata, formatSensitiveData } = useAuditLogs()

const { logs, headers, actions, filters, userMap } = toRefs(props)

function plainMetadata(metadata: any) {
  const html = formatMetadata(metadata)
  return html.replace(/<[^>]*>?/g, "")
}
</script>
