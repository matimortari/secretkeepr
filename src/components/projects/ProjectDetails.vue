<template>
  <div class="flex flex-col gap-4 border-b pb-4">
    <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
      <h4>
        Project Details
      </h4>
      <p class="text-sm text-muted-foreground">
        Manage project details and settings.
      </p>
    </header>

    <form class="flex flex-col gap-2 p-2 md:w-1/2" @submit.prevent="handleSubmit">
      <label class="text-sm font-medium" for="projectName">Project Name</label>
      <input id="projectName" v-model="form.name" type="text" placeholder="Enter project name" required>

      <label class="text-sm font-medium" for="projectDescription">Project Description</label>
      <textarea id="projectDescription" v-model="form.description" placeholder="Enter project description" rows="3" class="resize-none scroll-area" />

      <label class="text-sm font-medium" for="projectId">Project ID</label>
      <input id="projectId" :value="form.id ?? ''" type="text" class="bg-muted cursor-not-allowed" readonly>

      <button class="btn-primary self-start" type="submit">
        <Icon name="ph:check-circle" size="20" />
        <span>Save Changes</span>
      </button>
    </form>

    <div v-if="isOwner || isAdmin" class="flex flex-col gap-4 mt-4">
      <h4 class="text-base font-semibold">
        Project Members
      </h4>

      <ul class="flex flex-col gap-2 max-h-64 overflow-y-auto scroll-area">
        <li v-for="member in projectMembers" :key="member.userId" class="card flex flex-row items-center justify-between gap-4 p-2">
          <div class="flex flex-col max-w-40">
            <span class="font-semibold truncate">{{ member.user?.name }}</span>
            <span class="text-xs text-muted-foreground truncate">{{ member.user?.email }}</span>
          </div>

          <div v-if="member.userId !== currentUserId" class="flex items-center gap-2">
            <select v-model="member.role" class="min-w-[100px] capitalize" :disabled="!isOwner || member.role === 'owner'">
              <option v-for="role in assignableRoles" :key="role" :value="role" class="capitalize">
                {{ role }}
              </option>
            </select>

            <button class="btn" @click="handleUpdateRole(member.userId, member.role)">
              <Icon name="ph:check-bold" size="15" />
            </button>
            <button v-if="isOwner && member.role !== 'owner'" class="btn" @click="handleRemoveMember(member.userId)">
              <Icon name="ph:x" size="15" />
            </button>
          </div>
        </li>
      </ul>

      <div class="flex flex-col gap-2 border-t pt-4">
        <h5 class="font-medium text-sm">
          Add New Member
        </h5>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input v-model="newMemberId" type="text" placeholder="User ID">
          <select v-model="selectedNewMemberRole" class="min-w-[120px]">
            <option v-for="role in assignableRoles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>

          <button class="btn-primary" @click.prevent="handleAddMember">
            <Icon name="ph:plus-circle" size="20" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  project: ProjectType | null
}>()

const form = ref({
  name: props.project?.name || "",
  description: props.project?.description || "",
  id: props.project?.id || "",
})

watch(() => props.project, (newProject) => {
  form.value.name = newProject?.name || ""
  form.value.description = newProject?.description || ""
  form.value.id = newProject?.id || ""
})

async function handleSubmit() {
  if (!props.project)
    return

  try {
    await useProjectsStore().updateProject(props.project.id ?? "", {
      name: form.value.name,
      description: form.value.description,
    })
    await useProjectsStore().getProjects()
  }
  catch (error) {
    console.error("Failed to update project", error)
  }
}

const projectMembers = computed(() => props.project?.members || [])
const currentUserId = computed(() => useUserStore().user?.id)

const currentUserRole = computed(() => {
  return (
    projectMembers.value.find(
      m => m.user?.email === useUserStore().user?.email,
    )?.role ?? "member"
  )
})

onMounted(() => {
  useUserStore().getUser()
})

const isOwner = computed(() => currentUserRole.value === "owner")
const isAdmin = computed(() => currentUserRole.value === "admin")

const assignableRoles: Role[] = ["admin", "member"]

watch(projectMembers, (members) => {
  const roleMap: Record<string, Role> = {}
  for (const m of members) {
    roleMap[m.userId] = m.role
  }
  assignableRoles.forEach((role) => {
    if (!Object.values(roleMap).includes(role)) {
      roleMap[role] = role
    }
  })
}, { immediate: true })

const newMemberId = ref("")
const selectedNewMemberRole = ref<Role>("member")

async function handleAddMember() {
  if (!props.project?.id || !newMemberId.value.trim())
    return

  try {
    await useProjectsStore().addProjectMember(props.project.id, {
      userId: newMemberId.value.trim(),
      role: selectedNewMemberRole.value,
    })
    await useProjectsStore().getProjects()
    newMemberId.value = ""
    selectedNewMemberRole.value = "member"
  }
  catch (error) {
    console.error("Failed to add project member", error)
  }
}

async function handleUpdateRole(userId: string, newRole: Role) {
  if (!props.project?.id)
    return

  try {
    await useProjectsStore().updateProjectMember(props.project.id, userId, newRole)
    await useProjectsStore().getProjects()
  }
  catch (error) {
    console.error("Failed to update role", error)
  }
}

async function handleRemoveMember(userId: string) {
  if (!props.project?.id)
    return

  // eslint-disable-next-line no-alert
  const confirmed = window.confirm("Are you sure you want to remove this member?")
  if (!confirmed)
    return

  try {
    await useProjectsStore().removeProjectMember(props.project.id, userId)
    await useProjectsStore().getProjects()
  }
  catch (error) {
    console.error("Failed to remove member", error)
  }
}
</script>
