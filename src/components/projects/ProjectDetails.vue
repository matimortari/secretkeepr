<template>
  <div class="flex flex-col border-b">
    <div class="flex flex-col gap-2 border-b md:flex-row md:gap-8">
      <section class="flex flex-col gap-2 md:w-1/2">
        <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
          <h4>Project Details</h4>
          <p class="text-caption">
            Manage project details and settings.
          </p>
        </header>

        <form class="flex flex-col gap-2 p-2" @submit.prevent="handleSubmit">
          <label class="text-label" for="projectName">Project Name</label>
          <input id="projectName" v-model="form.name" type="text" placeholder="Enter project name">

          <span class="text-label" for="projectId">Project ID: <span class="text-muted-foreground">{{ form.id }}</span></span>

          <label class="text-label" for="projectDescription">Project Description</label>
          <textarea
            id="projectDescription" v-model="form.description"
            placeholder="Enter project description" rows="3"
            class="scroll-area resize-none"
          />

          <div class="flex flex-col gap-2 md:flex-row md:items-center">
            <button class="btn-primary md:self-start" type="submit" :disabled="!isOwner && !isAdmin">
              <Icon name="ph:check-circle" size="20" />
              <span>Save Changes</span>
            </button>

            <p v-if="projectsStore.error" class="text-sm text-danger-foreground">
              {{ projectsStore.error }}
            </p>
          </div>
        </form>
      </section>

      <section v-if="isOwner || isAdmin" class="flex flex-col gap-2 md:w-1/2">
        <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
          <h4>Project Members</h4>
          <p class="text-caption">
            Manage project members and their roles.
          </p>
        </header>

        <ul class="scroll-area flex max-h-52 flex-col items-start gap-2 overflow-y-auto">
          <li v-for="member in projectMembers" :key="member.userId" class="card text-label flex w-full min-w-0 flex-row items-center justify-between gap-2">
            <div class="flex min-w-0 flex-col gap-1 md:w-2/3">
              <span class="w-full min-w-0 truncate font-semibold md:w-40">{{ member.user?.name }}</span>
              <span class="min-w-0 max-w-full truncate text-xs text-muted-foreground md:max-w-52">{{ member.user?.email }}</span>
            </div>

            <nav v-if="member.userId !== currentUserId" class="navigation-group justify-end md:w-1/3">
              <select v-model="member.role" class="min-w-[100px] capitalize" :disabled="!isOwner || member.role === 'owner'">
                <option v-for="role in roles" :key="role.value" :value="role.value" class="capitalize">
                  {{ role.label }}
                </option>
              </select>
              <button class="btn" @click="handleUpdateMemberRole(member.userId, member.role)">
                <Icon name="ph:check-bold" size="15" />
              </button>
              <button v-if="isOwner && member.role !== 'owner'" class="btn" @click="handleRemoveMember(member.userId)">
                <Icon name="ph:x" size="15" />
              </button>
            </nav>
          </li>
        </ul>
      </section>
    </div>

    <section v-if="isOwner || isAdmin" class="md:navigation-group flex flex-col gap-2 p-2 md:justify-between">
      <header class="flex flex-col items-center text-center md:items-start md:text-start">
        <h5>Add New Member</h5>
        <p class="text-caption">
          Invite users to join this project.
        </p>
      </header>

      <nav class="md:navigation-group flex flex-col gap-2">
        <p v-if="addMemberError" class="text-caption my-2 text-danger-foreground">
          {{ addMemberError }}
        </p>
        <p v-if="addMemberSuccess" class="text-caption my-2 text-success-foreground">
          {{ addMemberSuccess }}
        </p>

        <input v-model="newMemberId" type="text" placeholder="User ID">
        <select v-model="newMemberRole" class="min-w-[120px]">
          <option v-for="role in roles" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>

        <button class="btn-primary" @click.prevent="handleAddMember">
          <Icon name="ph:plus-circle-bold" size="20" />
          <span>Add Member</span>
        </button>
      </nav>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  project: ProjectType | null
}>()

const roles: { value: Role, label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
]

const userStore = useUserStore()
const projectsStore = useProjectsStore()
const addMemberError = ref<string | null>(null)
const addMemberSuccess = ref<string | null>(null)
const newMemberId = ref("")
const newMemberRole = ref<Role>(roles[0].value)
const form = ref({
  name: props.project?.name || "",
  description: props.project?.description || "",
  id: props.project?.id || "",
})

const projectMembers = computed(() => props.project?.members || [])
const currentUserId = computed(() => userStore.user?.id)
const currentUserRole = computed(() => projectMembers.value.find(m => m.userId === currentUserId.value)?.role ?? "member")
const isOwner = computed(() => currentUserRole.value === "owner")
const isAdmin = computed(() => currentUserRole.value === "admin")

onMounted(() => {
  userStore.getUser()
})

async function handleAddMember() {
  addMemberError.value = ""
  addMemberSuccess.value = ""
  projectsStore.error = null
  if (!props.project?.id || !newMemberId.value.trim()) {
    addMemberError.value = "User ID is required."
    return
  }

  try {
    await projectsStore.addProjectMember(props.project.id, {
      userId: newMemberId.value.trim(),
      role: newMemberRole.value,
    })
    await projectsStore.getProjects()
    addMemberSuccess.value = "Member added successfully."
    newMemberId.value = ""
    newMemberRole.value = roles[0].value
  }
  catch (error: any) {
    console.error("Failed to add project member", error)
    addMemberError.value = error?.message || "Failed to add project member."
  }
}

async function handleUpdateMemberRole(userId: string, newRole: Role) {
  projectsStore.error = null
  if (!props.project?.id)
    return

  try {
    await projectsStore.updateProjectMember(props.project.id, userId, newRole)
    await projectsStore.getProjects()
  }
  catch (error: any) {
    console.error("Failed to update role", error)
    projectsStore.error = error?.message || "Failed to update member role."
  }
}

async function handleRemoveMember(userId: string) {
  projectsStore.error = null
  if (!props.project?.id)
    return
  if (!confirm("Are you sure you want to remove this member?"))
    return

  try {
    await projectsStore.removeProjectMember(props.project.id, userId)
    await projectsStore.getProjects()
  }
  catch (error: any) {
    console.error("Failed to remove member", error)
    projectsStore.error = error?.message || "Failed to remove project member."
  }
}

async function handleSubmit() {
  projectsStore.error = null
  if (!props.project?.id)
    return

  try {
    await projectsStore.updateProject({
      id: props.project.id ?? "",
      name: form.value.name,
      description: form.value.description,
    })
    await projectsStore.getProjects()
  }
  catch (error: any) {
    console.error("Failed to update project", error)
    projectsStore.error = error?.message || "Failed to update project."
  }
}

watch(() => props.project, (newProject) => {
  form.value.name = newProject?.name || ""
  form.value.description = newProject?.description || ""
  form.value.id = newProject?.id || ""
}, { immediate: true })
</script>
