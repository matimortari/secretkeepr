<template>
  <NuxtLink :to="`/admin/${project.id}`">
    <div class="card relative h-[180px] w-full overflow-hidden border-2 hover:border-secondary group">
      <div class="flex flex-col gap-2 p-2 h-full">
        <h4 class="truncate">
          {{ project.name }}
        </h4>
        <p class="text-sm text-muted-foreground line-clamp-3">
          {{ project.description || 'No description provided.' }}
        </p>
      </div>

      <div class="absolute bottom-4 left-4 navigation-group text-muted-foreground">
        <Icon name="ph:key-bold" size="20" class="group-hover:text-secondary group-hover:scale-sm transition-all duration-500" />
        <span class="font-medium group-hover:text-secondary group-hover:scale-sm transition-all duration-500">{{ totalProjectSecrets }}</span>

        <NuxtLink :to="`/admin/${project.id}/settings`" class="group-hover:text-secondary group-hover:scale-sm transition-all duration-500">
          <Icon name="ph:gear-bold" size="20" class="mt-1 ml-2" />
        </NuxtLink>
      </div>

      <Icon name="ph:arrow-right-bold" size="35" class="absolute bottom-4 right-4 text-muted-foreground group-hover:scale-sm group-hover:text-secondary transition-all duration-500" />
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
