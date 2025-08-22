<template>
  <nuxt-link :to="`/admin/${project.slug}`">
    <div class="card group relative h-[180px] w-full overflow-hidden border-2 hover:border-secondary">
      <div class="flex h-full flex-col gap-2 p-2">
        <h4 class="truncate">
          {{ project.name }}
        </h4>
        <p class="text-info line-clamp-3">
          {{ project.description || 'No description provided.' }}
        </p>
      </div>

      <div class="navigation-group absolute bottom-4 left-4 gap-4 text-muted-foreground">
        <nuxt-link :to="`/admin/${project.slug}/settings`" class="flex items-center">
          <icon name="ph:gear-bold" size="20" class="hover:scale-sm transition-all" />
        </nuxt-link>
        <div class="flex flex-row items-center gap-2">
          <icon name="ph:key-bold" size="20" />
          <span class="text-sm">{{ totalProjectSecrets }}</span>
        </div>
      </div>

      <div class="absolute bottom-4 right-4 flex items-center justify-center rounded-full bg-muted p-2">
        <icon name="ph:arrow-right-bold" size="25" class="group-hover:scale-sm transition-all group-hover:text-secondary" />
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
const props = defineProps<{
  project: ProjectType
}>()

const totalProjectSecrets = computed(() => {
  return props.project.secrets?.length || 0
})
</script>
