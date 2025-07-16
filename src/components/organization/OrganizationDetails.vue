<template>
  <div class="flex flex-col gap-2 border-b">
    <div class="flex flex-col md:flex-row gap-2 border-b">
      <div class="md:w-1/2 flex flex-col gap-2">
        <section class="flex flex-col gap-2">
          <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
            <h4>
              Organization Details
            </h4>
            <p class="text-sm text-muted-foreground">
              Manage organization details and settings.
            </p>
          </header>

          <form class="flex flex-col gap-2 p-2" @submit.prevent="handleSubmit">
            <label class="text-sm font-medium">Organization Name</label>
            <input v-model="form.name" type="text" placeholder="Enter organization name">

            <label class="text-sm font-medium">Organization ID</label>
            <input :value="organization?.id ?? ''" type="text" class="bg-muted cursor-not-allowed" readonly>

            <label class="text-sm font-medium">Created At</label>
            <input :value="organization?.createdAt" type="text" class="bg-muted cursor-not-allowed" readonly>

            <label class="text-sm font-medium">Last Updated</label>
            <input :value="organization?.updatedAt" type="text" class="bg-muted cursor-not-allowed" readonly>

            <label class="text-sm font-medium">Default User Role</label>
            <select v-model="defaultRole">
              <option v-for="role in assignableRoles" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>

            <button class="btn-primary self-start" type="submit">
              <Icon name="ph:check-circle" size="20" />
              <span>Save Changes</span>
            </button>
          </form>
        </section>
      </div>

      <div class="md:w-1/2 flex flex-col gap-2">
        <section class="flex flex-col gap-2">
          <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
            <h4>
              Projects
            </h4>
            <p class="text-sm text-muted-foreground">
              Manage projects associated with this organization.
            </p>
          </header>

          <ul class="flex flex-row items-start gap-2 overflow-x-auto scroll-area">
            <li
              v-for="project in projectsFromOrg"
              :key="project.id"
              class="card relative min-w-[200px] h-[150px] overflow-hidden"
            >
              <h6 class="truncate">
                {{ project.name }}
              </h6>
              <p class="text-sm text-muted-foreground break-words">
                {{ project.description || "No description provided." }}
              </p>
              <button
                class="absolute top-2 right-2 text-danger"
                @click="project.id && handleDeleteProject(project.id)"
              >
                <Icon name="ph:trash-bold" />
              </button>
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-2">
          <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
            <h4>
              Current Users
            </h4>
            <p class="text-sm text-muted-foreground">
              Manage roles and permissions for organization members.
            </p>
          </header>

          <ul class="flex flex-col items-start gap-2 overflow-y-auto max-h-56 scroll-area">
            <li
              v-for="user in usersWithRoles"
              :key="user.id"
              class="card flex flex-row items-center justify-between gap-2 text-sm w-full"
            >
              <div class="flex flex-col gap-1">
                <span class="font-semibold">{{ user.name }}</span>
                <span class="text-xs capitalize">
                  Role: {{ Array.isArray(user.role) ? user.role.join(", ") : user.role }}
                </span>
              </div>

              <div class="flex flex-col gap-1 text-muted-foreground">
                <span class="text-xs">{{ user.id }}</span>
                <span class="text-xs">{{ user.email }}</span>
              </div>

              <div v-if="user.role !== 'owner'" class="button-group">
                <select v-model="userRoles[user.id ?? '']" class="min-w-[100px]">
                  <option v-for="role in assignableRoles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
                <div class="flex flex-row items-center gap-1">
                  <button class="btn" @click="() => handleUpdateMemberRole(user.id, userRoles[user.id]!)">
                    <Icon name="ph:check-bold" size="20" />
                  </button>
                  <button class="btn" @click="user.id && handleRemoveMember(user.id)">
                    <Icon name="ph:x-bold" size="20" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <section class="flex flex-col md:flex-row md:items-center md:justify-between px-2 pb-2">
      <header class="flex flex-col items-center text-center md:items-start md:text-start gap-1">
        <h5>
          Invite Members
        </h5>
        <p class="text-sm text-muted-foreground">
          Generate an invitation link to invite new users to this organization.
        </p>
      </header>

      <div class="flex flex-row-reverse items-center gap-2">
        <button class="btn-primary" @click="handleCreateInvite">
          <Icon name="ph:link" size="20" />
          <span>Create Invite Link</span>
        </button>

        <div v-if="inviteLink" class="relative">
          <input type="text" :value="inviteLink" readonly class="pr-10">
          <button class="absolute inset-y-0 right-0 flex flex-row items-center pr-2 text-muted-foreground" type="button" @click="copyInviteLink">
            <Icon name="ph:copy" size="20" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  organization: OrganizationType | null
}>()

const emit = defineEmits<{
  (e: "refresh"): void
}>()

const form = ref({
  name: props.organization?.name || "",
})

const { projects } = storeToRefs(useProjectsStore())

watch(() => props.organization, (newOrg) => {
  form.value.name = newOrg?.name || ""
})

onMounted(async () => {
  await useProjectsStore().getProjects()
})

const projectsFromOrg = computed(() => {
  return projects.value.filter(project =>
    project.organizationId === props.organization?.id
    && typeof project.name === "string",
  )
})

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
]

const { inviteLink } = storeToRefs(useOrganizationStore())

const defaultRole = ref<Role>("member")
const userRoles = ref<Record<string, Role>>({})
const assignableRoles = roles.filter(r => r.value !== "owner")

const usersWithRoles = computed<{ name: string, id: string, email: string, role: Role }[]>(() => {
  if (!props.organization?.memberships)
    return []

  return props.organization.memberships
    .filter((m): m is Required<UserOrganizationMembershipType> => !!m.user)
    .map(m => ({
      name: m.user!.name ?? "(no name)",
      id: m.user!.id,
      email: m.user!.email ?? "(no email)",
      role: m.role,
    }))
})

async function handleUpdateMemberRole(memberId: string, newRole: Role) {
  try {
    await useOrganizationStore().updateOrganizationMember(memberId, newRole)
    emit("refresh")
  }
  catch (error) {
    console.error("Failed to update member role", error)
  }
}

async function handleRemoveMember(memberId: string) {
  // eslint-disable-next-line no-alert
  if (!confirm("Are you sure you want to remove this member?"))
    return
  try {
    await useOrganizationStore().removeOrganizationMember(memberId)
    emit("refresh")
  }
  catch (error) {
    console.error("Failed to remove member", error)
  }
}

function handleCreateInvite() {
  useOrganizationStore().createInviteLink()
}

function copyInviteLink() {
  const link = useOrganizationStore().inviteLink
  if (link) {
    navigator.clipboard.writeText(link)
  }
}

async function handleSubmit() {
  if (!props.organization)
    return

  try {
    await useOrganizationStore().updateOrganization(props.organization.id, {
      name: form.value.name,
    })
    await useUserStore().getUser() // TODO: check this behavior
  }
  catch (error) {
    console.error("Failed to update organization:", error)
  }
}

async function handleDeleteProject(projectId: string) {
  try {
    await useProjectsStore().deleteProject(projectId)
  }
  catch (error) {
    console.error("Failed to delete project:", error)
  }
}

watch(usersWithRoles, (users) => {
  const map: Record<string, Role> = {}
  users.forEach((user) => {
    if (user.id !== undefined) {
      map[user.id] = user.role
    }
  })
  userRoles.value = map
}, { immediate: true })
</script>
