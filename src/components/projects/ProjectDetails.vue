<template>
  <div class="flex flex-col border-b">
    <div class="flex flex-col gap-2 border-b md:flex-row md:gap-8">
      <div class="flex flex-col gap-2 md:w-1/2">
        <section class="flex flex-col">
          <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
            <h4>
              Project Details
            </h4>
            <p class="text-caption text-muted-foreground">
              Manage project details and settings.
            </p>
          </header>

          <form class="flex flex-col gap-2 p-2" @submit.prevent="handleSubmit">
            <label class="text-label" for="projectName">Project Name</label>
            <input
              id="projectName" v-model="form.name"
              type="text" placeholder="Enter project name"
              required
            >

            <label class="text-label" for="projectDescription">Project Description</label>
            <textarea
              id="projectDescription" v-model="form.description"
              placeholder="Enter project description" rows="3"
              class="scroll-area resize-none"
            />

            <label class="text-label" for="projectId">Project ID</label>
            <input
              id="projectId" :value="form.id ?? ''"
              type="text" class="cursor-not-allowed bg-muted"
              readonly
            >

            <p v-if="errorMsg" class="text-caption text-danger">
              {{ errorMsg }}
            </p>

            <button class="btn-primary md:self-start" type="submit">
              <Icon name="ph:check-circle" size="20" />
              <span>Save Changes</span>
            </button>
          </form>
        </section>
      </div>

      <div v-if="isOwner || isAdmin" class="flex flex-col gap-2 md:w-1/2">
        <section class="flex flex-col">
          <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
            <h4>
              Project Members
            </h4>
            <p class="text-caption text-muted-foreground">
              Manage project members and their roles.
            </p>
          </header>

          <ul class="scroll-area flex max-h-52 flex-col items-start gap-2 overflow-y-auto">
            <li v-for="member in projectMembers" :key="member.userId" class="card text-label flex w-full min-w-0 flex-row items-center justify-between gap-2">
              <div class="flex min-w-0 flex-col gap-1 md:w-2/3">
                <span class="w-full min-w-0 truncate font-semibold md:w-40">{{ member.user?.name }}</span>
                <span class="min-w-0 max-w-full truncate text-xs text-muted-foreground md:max-w-52">{{ member.user?.email }}</span>
              </div>

              <div v-if="member.userId !== currentUserId" class="navigation-group justify-end md:w-1/3">
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
        </section>
      </div>
    </div>

    <section v-if="isOwner || isAdmin" class="md:navigation-group flex flex-col gap-2 p-2 md:justify-between">
      <header class="flex flex-col items-center text-center md:items-start md:text-start">
        <h5>
          Add New Member
        </h5>
        <p class="text-caption text-muted-foreground">
          Invite users to join this project.
        </p>
      </header>

      <div class="md:navigation-group flex flex-col gap-2">
        <input v-model="newMemberId" type="text" placeholder="User ID">
        <select v-model="selectedNewMemberRole" class="min-w-[120px]">
          <option v-for="role in assignableRoles" :key="role" :value="role">
            {{ role }}
          </option>
        </select>

        <button class="btn-primary" @click.prevent="handleAddMember">
          <Icon name="ph:plus-circle-bold" size="20" />
          <span>Add</span>
        </button>
      </div>

      <p v-if="memberErrorMsg" class="text-caption my-2 text-danger">
        {{ memberErrorMsg }}
      </p>
    </section>
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

const userStore = useUserStore()
const projectsStore = useProjectsStore()

watch(() => props.project, (newProject) => {
  form.value.name = newProject?.name || ""
  form.value.description = newProject?.description || ""
  form.value.id = newProject?.id || ""
})

const errorMsg = ref("")
const memberErrorMsg = ref("")
const newMemberId = ref("")
const selectedNewMemberRole = ref<Role>("member")
const assignableRoles: Role[] = ["admin", "member"]

const projectMembers = computed(() => props.project?.members || [])
const currentUserId = computed(() => userStore.user?.id)

const currentUserRole = computed(() => {
  return (
    projectMembers.value.find(
      m => m.user?.email === userStore.user?.email,
    )?.role ?? "member"
  )
})

const isOwner = computed(() => currentUserRole.value === "owner")
const isAdmin = computed(() => currentUserRole.value === "admin")

async function handleSubmit() {
  if (!props.project)
    return

  errorMsg.value = ""
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
    errorMsg.value = error?.message || "Failed to update project."
  }
}

onMounted(() => {
  userStore.getUser()
})

async function handleAddMember() {
  memberErrorMsg.value = ""
  if (!props.project?.id || !newMemberId.value.trim())
    return

  try {
    await projectsStore.addProjectMember(props.project.id, {
      userId: newMemberId.value.trim(),
      role: selectedNewMemberRole.value,
    })
    await projectsStore.getProjects()
    newMemberId.value = ""
    selectedNewMemberRole.value = "member"
  }
  catch (error: any) {
    console.error("Failed to add project member", error)
    memberErrorMsg.value = error?.message || "Failed to add project member."
  }
}

async function handleUpdateRole(userId: string, newRole: Role) {
  if (!props.project?.id)
    return

  try {
    await projectsStore.updateProjectMember(props.project.id, userId, newRole)
    await projectsStore.getProjects()
  }
  catch (error: any) {
    console.error("Failed to update role", error)
    memberErrorMsg.value = error?.message || "Failed to update role."
  }
}

async function handleRemoveMember(userId: string) {
  if (!props.project?.id)
    return

  const confirmed = window.confirm("Are you sure you want to remove this member?")
  if (!confirmed)
    return

  try {
    await projectsStore.removeProjectMember(props.project.id, userId)
    await projectsStore.getProjects()
  }
  catch (error: any) {
    console.error("Failed to remove member", error)
    memberErrorMsg.value = error?.message || "Failed to remove member."
  }
}
</script>
