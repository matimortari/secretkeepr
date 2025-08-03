<template>
  <NuxtLink :to="`/admin/${project.id}`">
    <div class="card group relative h-[180px] w-full overflow-hidden border-2 hover:border-secondary">
      <div class="flex h-full flex-col gap-2 p-2">
        <h4 class="truncate">
          {{ project.name }}
        </h4>
        <p class="text-info line-clamp-3">
          {{ project.description || 'No description provided.' }}
        </p>
      </div>

      <div class="navigation-group absolute bottom-4 left-4 text-muted-foreground">
        <Icon name="ph:key-bold" size="20" class="group-hover:scale-sm transition-all group-hover:text-secondary" />
        <span class="group-hover:scale-sm font-medium transition-all group-hover:text-secondary">{{ totalProjectSecrets }}</span>

        <NuxtLink :to="`/admin/${project.id}/settings`" class="group-hover:scale-sm transition-all group-hover:text-secondary">
          <Icon name="ph:gear-bold" size="20" class="ml-2 mt-1" />
        </NuxtLink>
      </div>

      <div class="absolute bottom-4 right-4 flex items-center justify-center rounded-full bg-muted p-2">
        <Icon name="ph:arrow-right-bold" size="30" class="group-hover:scale-sm transition-all group-hover:text-secondary" />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  project: ProjectType
}>()

const totalProjectSecrets = computed(() => {
  return props.project.secrets?.length || 0
})
</script>
