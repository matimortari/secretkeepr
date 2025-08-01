<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <header class="navigation-group border-b py-2">
      <NuxtLink :to="`/admin/${project?.id}`">
        <Icon name="ph:arrow-left-bold" size="25" class="hover:scale-sm text-muted-foreground hover:text-accent md:mt-2" />
      </NuxtLink>
      <h2 class="max-w-lg truncate">
        {{ project?.name }}
      </h2>
    </header>

    <form class="flex flex-col" @submit.prevent="handleSubmit">
      <nav class="md:navigation-group flex flex-col items-center justify-between border-b p-2 text-center md:text-start">
        <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
          <h4>
            Project Details
          </h4>
          <p class="text-caption">
            Manage project details and settings.
          </p>
        </header>

        <div class="flex flex-col gap-2 md:flex-row md:items-center">
          <p v-if="projectsStore.error" class="text-caption text-danger-foreground">
            {{ projectsStore.error }}
          </p>

          <button class="btn-primary md:self-start" type="submit" :disabled="!isOwner && !isAdmin">
            <Icon name="ph:check-circle" size="20" />
            <span>Save Changes</span>
          </button>
        </div>
      </nav>

      <section class="flex flex-col px-8">
        <div
          v-for="(field, index) in projectFields" :key="index"
          class="md:navigation-group flex flex-col items-center justify-between border-b p-4 text-center md:text-start"
        >
          <div class="flex flex-col items-center justify-center gap-1 md:items-start md:text-start">
            <h6>
              {{ field.label }}
            </h6>
            <p v-if="field.description" class="text-caption">
              {{ field.description }}
            </p>
          </div>

          <div v-if="field.copyable" class="md:navigation-group flex flex-col gap-1">
            <span class="text-caption">{{ field.value }}</span>
            <div class="btn" @click="copyToClipboard(field.value?.value || '')">
              <Icon name="ph:clipboard-bold" size="20" />
              <span>Copy</span>
            </div>
          </div>

          <div v-else-if="field.type === 'textarea'" class="md:navigation-group flex flex-col gap-1">
            <textarea
              :value="field.model.value" class="scroll-area w-full resize-none"
              @input="field.update && $event.target && field.update(($event.target as HTMLTextAreaElement).value)"
            />
            <div class="btn" @click="field.onSave">
              <Icon name="ph:check-bold" size="20" />
              <span>Save</span>
            </div>
          </div>

          <span v-else class="text-caption md:navigation-group flex flex-col gap-1">{{ field.value }}</span>
        </div>
      </section>
    </form>

    <section class="flex flex-col justify-between border-b p-4">
      <h4>
        Project Members
      </h4>

      <ul class="scroll-area flex max-h-52 flex-col items-start gap-1 overflow-y-auto">
        <li v-for="member in projectMembers" :key="member.userId" class="card navigation-group w-full min-w-0 justify-between">
          <div class="flex min-w-0 flex-col gap-1 md:w-2/3">
            <span class="w-full min-w-0 truncate font-semibold md:w-40">{{ member.user?.name }}</span>
            <span class="text-caption min-w-0 max-w-full truncate md:max-w-52">{{ member.user?.email }}</span>
          </div>

          <nav v-if="isOwner || (isAdmin && member.userId !== userStore.user?.id)" class="navigation-group justify-end md:w-1/3">
            <select v-model="member.role" class="min-w-[100px] capitalize">
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

    <section v-if="isOwner || isAdmin" class="md:navigation-group flex flex-col items-center justify-between border-b p-4 px-10 text-center md:items-start md:text-start">
      <div class="flex flex-col gap-1">
        <h6>
          Add New Member
        </h6>
        <p class="text-caption">
          Invite users to join this project.
        </p>
      </div>

      <div class="md:navigation-group flex flex-col gap-2">
        <p v-if="addMemberError" class="text-caption text-danger-foreground">
          {{ addMemberError }}
        </p>
        <p v-if="addMemberSuccess" class="text-caption text-success-foreground">
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
      </div>
    </section>

    <div v-if="isOwner" class="flex flex-col">
      <nav class="md:navigation-group flex w-full flex-col justify-between border-b p-2">
        <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
          <h4>
            Danger Zone
          </h4>
          <p class="text-caption">
            This section contains actions that can significantly affect your account. Please proceed with caution.
          </p>
        </header>
      </nav>

      <section class="md:navigation-group flex flex-col items-center justify-between border-b p-4 px-10 text-center md:items-start md:text-start">
        <div class="flex flex-col gap-1">
          <h6>
            Delete Project
          </h6>
          <p class="text-caption text-danger-foreground">
            This action is irreversible. All data associated with this project will be permanently deleted.
          </p>
        </div>

        <button class="btn-danger" @click="handleDeleteProject">
          <Icon name="ph:user-minus-bold" size="20" />
          <span>Delete Account</span>
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import auth from "~/lib/middleware/auth"
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"
import { copyToClipboard, formatDate } from "~/lib/utils"

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
]

const router = useRouter()
const route = useRoute()
const projectId = route.params.project as string
const userStore = useUserStore()
const projectsStore = useProjectsStore()

const addMemberError = ref<string | null>(null)
const addMemberSuccess = ref<string | null>(null)
const newMemberId = ref("")
const newMemberRole = ref(roles[0].value)

const project = computed(() => {
  return projectsStore.projects.find(p => p.id === projectId) || null
})

const projectMembers = computed(() => project.value?.members || [])
const currentUserRole = computed(() => projectMembers.value.find(m => m.userId === userStore.user?.id)?.role)
const isOwner = computed(() => currentUserRole.value === "owner")
const isAdmin = computed(() => currentUserRole.value === "admin")

const projectFields = [
  {
    label: "Project ID",
    description: "This ID uniquely identifies your project.",
    value: computed(() => project.value?.id),
    copyable: true,
  },
  {
    label: "Created At",
    description: "When your project was created.",
    value: computed(() => formatDate(project.value?.createdAt)),
  },
  {
    label: "Updated At",
    description: "Last update time for your project.",
    value: computed(() => formatDate(project.value?.updatedAt)),
  },
  {
    label: "Project Description",
    description: "Briefly describe the purpose or content of this project.",
    type: "textarea",
    model: computed(() => project.value?.description),
    update: (value: string) => {
      if (project.value)
        project.value.description = value
    },
    onSave: handleSubmit,
  },
]

async function handleAddMember() {
  addMemberError.value = ""
  addMemberSuccess.value = ""
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
    newMemberRole.value = roles[0].value
  }
  catch (error: any) {
    console.error("Failed to add project member", error)
    addMemberError.value = error?.message || "Failed to add project member."
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
    console.error("Failed to update role", error)
    projectsStore.error = error?.message || "Failed to update member role."
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
    projectsStore.error = error?.message || "Failed to remove project member."
  }
}

async function handleSubmit() {
  projectsStore.error = null
  if (!project.value?.id)
    return

  try {
    await projectsStore.updateProject(project.value.id, {
      name: project.value?.name,
      description: project.value?.description,
    })
    await projectsStore.getProjects()
  }
  catch (error: any) {
    console.error("Failed to update project", error)
    projectsStore.error = error?.message || "Failed to update project."
  }
}

async function handleDeleteProject() {
  projectsStore.error = null
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
    projectsStore.error = error?.message || "Failed to delete project."
  }
}

onMounted(() => {
  userStore.getUser()
})

watch(() => project.value, (newProject) => {
  if (newProject && project.value) {
    project.value.name = newProject.name
    project.value.description = newProject.description
    project.value.id = newProject.id
  }
}, { immediate: true })

watch(() => projectId, async (id) => {
  await projectsStore.getProjects()
  const projectTitle = projectsStore.projects?.find(p => p.id === id)?.name

  useHead({
    title: `${projectTitle} | Settings – SecretKeepR`,
    link: [{ rel: "canonical", href: `https://secretkeepr.vercel.app/${id}/settings` }, { rel: "icon", href: "/favicon.ico" }],
    meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
  })

  useSeoMeta({
    title: `${projectTitle} | Settings – SecretKeepR`,
    description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
  })
}, { immediate: true })

definePageMeta({
  layout: "admin",
  middleware: auth,
})
</script>
