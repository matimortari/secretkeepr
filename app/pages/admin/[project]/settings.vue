<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <header class="navigation-group border-b py-2">
      <nuxt-link :to="`/admin/${project?.slug}`" aria-label="Go back" class="flex items-center">
        <icon name="ph:arrow-left-bold" size="25" class="hover:scale-sm text-muted-foreground hover:text-accent" />
      </nuxt-link>
      <h2 class="max-w-lg truncate">
        {{ project?.name }}
      </h2>
    </header>

    <section class="flex flex-col">
      <div class="md:navigation-group gap-2 border-b p-4">
        <header class="flex flex-col gap-2">
          <h3>
            Project Details
          </h3>
          <p class="text-caption">
            Manage project details and settings.
          </p>
        </header>

        <p v-if="projectsStore.error" class="text-warning">
          {{ projectsStore.error }}
        </p>
      </div>

      <!-- Project Details -->
      <div v-for="(field, index) in projectFields" :key="index" class="md:navigation-group flex flex-col justify-between gap-2 border-b p-4 md:px-10">
        <div class="flex flex-col items-start justify-center gap-1 text-start">
          <h5>
            {{ field.label }}
          </h5>
          <p v-if="field.description" class="text-caption">
            {{ field.description }}
          </p>
        </div>

        <div v-if="field.copyable" class="navigation-group justify-end">
          <span>{{ field.value }}</span>
          <button
            class="btn" title="Copy to Clipboard"
            aria-label="Copy to Clipboard" @click="copyIcon[index]?.triggerCopy(field.value?.value || '')"
          >
            <icon :name="copyIcon[index]?.icon.value || 'ph:copy-bold'" size="20" />
          </button>
        </div>

        <div v-else-if="field.type === 'input'" class="navigation-group justify-end">
          <input class="w-full" type="text" :value="field.model?.value" @input="field.update?.(($event.target as HTMLInputElement).value)">
          <button class="btn" aria-label="Save Changes" @click="field.onSave(index)">
            <icon :name="saveIcon[index]?.icon.value || 'ph:floppy-disk-bold'" size="20" />
          </button>
        </div>

        <span v-else class="navigation-group justify-end">{{ field.value }}</span>
      </div>

      <!-- Project Members List -->
      <section class="flex flex-col justify-between border-b p-4 md:px-10">
        <h5>
          Project Members
        </h5>

        <ul class="scroll-area flex max-h-52 flex-col items-start gap-1 overflow-y-auto">
          <li v-for="member in projectMembers" :key="member.userId" class="card navigation-group w-full justify-between overflow-hidden">
            <div class="flex min-w-0 flex-row items-center gap-2">
              <img :src="member.user?.image ?? undefined" alt="Avatar" class="hidden size-10 rounded-full border-2 md:block">
              <div class="flex min-w-0 flex-col">
                <span class="truncate">{{ member.user?.name }}</span>
                <span class="text-caption truncate">Role: {{ member.role }}</span>
                <span class="text-caption truncate">{{ member.userId }}</span>
              </div>
            </div>

            <nav v-if="(isOwner || isAdmin) && member.userId !== userStore.user?.id && member.role !== 'owner'" class="navigation-group justify-end md:w-1/3" aria-label="Project Member Actions">
              <select v-model="member.role">
                <option v-for="role in roles.filter(r => r.value !== 'owner')" :key="role.value" :value="role.value" class="capitalize">
                  {{ role.label }}
                </option>
              </select>

              <button class="btn" aria-label="Update Member Role" @click="handleUpdateMemberRole(member.userId, member.role)">
                <icon name="ph:floppy-disk-bold" size="15" />
              </button>
              <button v-if="isOwner && String(member.role) !== 'owner'" class="btn" aria-label="Remove Member" @click="handleRemoveMember(member.userId)">
                <icon name="ph:x-bold" size="15" />
              </button>
            </nav>
          </li>
        </ul>
      </section>
    </section>

    <!-- Add New Member -->
    <section v-if="isOwner || isAdmin" class="md:navigation-group flex flex-col justify-between gap-2 border-b p-4 md:px-10" aria-label="Add New Member">
      <header class="flex flex-col gap-1">
        <h5>
          Add New Member
        </h5>
        <p class="text-caption">
          Invite users to join this project.
        </p>
      </header>

      <div class="md:navigation-group flex flex-col gap-1">
        <div class="flex flex-row items-center gap-2">
          <input v-model="newMemberId" type="text" placeholder="User ID" class="w-32">
          <select v-model="newMemberRole" class="md:min-w-[120px]">
            <option v-for="role in [...roles].reverse().filter(r => r.value !== 'owner')" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <div class="navigation-group self-end">
          <p v-if="addMemberError" class="text-warning">
            {{ addMemberError }}
          </p>
          <p v-if="addMemberSuccess" class="text-success">
            {{ addMemberSuccess }}
          </p>
          <button class="btn-primary" aria-label="Add Member" @click.prevent="handleAddMember">
            <icon name="ph:plus-circle-bold" size="20" />
            <span>Add Member</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Danger Zone -->
    <section v-if="isOwner" class="flex flex-col">
      <header class="flex flex-col items-start gap-1 border-b p-4 text-start">
        <h3>
          Danger Zone
        </h3>
        <p class="text-caption">
          This section contains actions that can significantly affect your account. Please proceed with caution.
        </p>
      </header>

      <nav class="md:navigation-group flex flex-col justify-between gap-2 border-b p-4 md:px-10" aria-label="Delete Project">
        <header class="flex flex-col gap-1">
          <h5>
            Delete Project
          </h5>
          <p class="text-warning">
            This action is irreversible. All data associated with this project will be permanently deleted.
          </p>
        </header>

        <div class="navigation-group self-end">
          <p v-if="deleteProjectError" class="text-warning">
            {{ deleteProjectError }}
          </p>

          <button class="btn-danger" aria-label="Delete Project" @click="handleDeleteProject">
            <icon name="ph:trash-bold" size="20" />
            <span>Confirm</span>
          </button>
        </div>
      </nav>
    </section>
  </div>
</template>

<script setup lang="ts">
const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
]

const router = useRouter()
const route = useRoute()
const slug = route.params.project as string
const { createActionHandler } = useActionIcon()
const orgStore = useOrganizationStore()
const userStore = useUserStore()
const projectsStore = useProjectsStore()

const addMemberError = ref<string | null>(null)
const addMemberSuccess = ref<string | null>(null)
const deleteProjectError = ref<string | null>(null)
const newMemberId = ref("")
const newMemberRole = ref(roles[0]?.value ?? "member")

const project = computed(() => projectsStore.projects.find(p => p.slug === slug) || null)
const projectId = computed(() => project.value?.id ?? "")
const projectMembers = computed(() => project.value?.members || [])

const currentUserMembership = computed(() => projectMembers.value.find(m => m.userId === userStore.user?.id))
const currentUserRole = computed(() => currentUserMembership.value?.role ?? "member")
const isOwner = computed(() => currentUserRole.value === "owner")
const isAdmin = computed(() => currentUserRole.value === "admin")

const projectFields = [
  {
    label: "Project Name",
    description: "The name of your project.",
    type: "input",
    model: computed(() => project.value?.name),
    update: (value: string) => {
      if (project.value)
        project.value.name = value
    },
    onSave: handleSubmit,
    editable: isOwner,
  },
  {
    label: "Project ID",
    description: "This ID uniquely identifies your project.",
    value: computed(() => project.value?.id),
    copyable: true,
  },
  {
    label: "Project Slug",
    description: "This slug is used in the URL to access your project.",
    type: "input",
    model: computed(() => project.value?.slug),
    update: (value: string) => {
      if (project.value)
        project.value.slug = value
    },
    onSave: handleSubmit,
    editable: isOwner,
  },
  {
    label: "Project Description",
    description: "Briefly describe the purpose or content of this project.",
    type: "input",
    model: computed(() => project.value?.description),
    update: (value: string) => {
      if (project.value)
        project.value.description = value
    },
    onSave: handleSubmit,
    editable: isOwner,
  },
  {
    label: "Created At",
    description: "When your project was created.",
    value: computed(() => formatDate(project.value?.createdAt)),
  },
  {
    label: "Updated At",
    description: "When your project was last updated.",
    value: computed(() => formatDate(project.value?.updatedAt)),
  },
]

const copyIcon = projectFields.map(field => field.copyable ? createActionHandler("ph:copy-bold") : null)
const saveIcon = projectFields.map(() => createActionHandler("ph:floppy-disk-bold"))

async function handleAddMember() {
  addMemberError.value = null
  addMemberSuccess.value = null
  projectsStore.error = null
  if (!project.value?.id || !newMemberId.value.trim()) {
    addMemberError.value = "User ID is required."
    return
  }

  try {
    await projectsStore.addProjectMember(project.value.id, {
      userId: newMemberId.value.trim(),
      role: newMemberRole.value as Role,
    })
    await projectsStore.getProjects()
    addMemberSuccess.value = "Member added successfully."
    newMemberId.value = ""
    newMemberRole.value = roles[0]?.value ?? "member"
  }
  catch (error: any) {
    console.error("Failed to add member", error)
    addMemberError.value = error.message
  }
}

async function handleUpdateMemberRole(memberId: string, newRole: Role) {
  projectsStore.error = null
  if (!project.value?.id)
    return

  try {
    await projectsStore.updateProjectMember(project.value.id, memberId, newRole)
    await projectsStore.getProjects()
  }
  catch (error: any) {
    console.error("Failed to update memeber role", error)
    projectsStore.error = error.message
  }
}

async function handleRemoveMember(memberId: string) {
  projectsStore.error = null
  if (!project.value?.id)
    return
  if (!confirm("Are you sure you want to remove this member?"))
    return

  try {
    await projectsStore.removeProjectMember(project.value.id, memberId)
    await projectsStore.getProjects()
  }
  catch (error: any) {
    console.error("Failed to remove member", error)
    projectsStore.error = error.message
  }
}

async function handleSubmit(index: number) {
  projectsStore.error = null
  if (!project.value?.id)
    return

  try {
    await projectsStore.updateProject(project.value.id, {
      name: project.value?.name,
      description: project.value?.description,
    })
    await projectsStore.getProjects()
    saveIcon[index]?.triggerSuccess()
  }
  catch (error: any) {
    console.error("Failed to update project", error)
    projectsStore.error = error.message
  }
}

async function handleDeleteProject() {
  deleteProjectError.value = null
  if (!project.value?.id)
    return
  if (!confirm("Are you sure you want to delete this project? This action cannot be undone."))
    return

  try {
    await projectsStore.deleteProject(project.value.id)
    router.push("/admin/projects")
  }
  catch (error: any) {
    console.error("Failed to delete project:", error)
    deleteProjectError.value = error.message
  }
}

watch([() => project.value, () => orgStore.activeOrg], ([proj, activeOrg]) => {
  if (proj && activeOrg && proj.orgId !== activeOrg.id) {
    console.warn("Attempted to access project settings from non-active org")
    router.push("/admin/projects")
  }
}, { immediate: true })

watch(() => projectId.value, async (id) => {
  const projectTitle = projectsStore.projects?.find(p => p.id === id)?.name

  useHead({
    title: `${projectTitle} | Settings`,
    link: [{ rel: "canonical", href: `https://secretkeepr.vercel.app/${id}/settings` }],
    meta: [{ name: "description", content: `${projectTitle} project settings page.` }],
  })
}, { immediate: true })

definePageMeta({
  layout: "admin",
  middleware: auth,
})
</script>
