<template>
  <div class="flex flex-col border-b">
    <div class="flex flex-col gap-2 border-b md:flex-row md:gap-8">
      <div class="flex flex-col gap-2 md:w-1/2">
        <section class="flex flex-col">
          <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
            <h4>
              Organization Details
            </h4>
            <p class="text-caption text-muted-foreground">
              Manage organization details and settings.
            </p>
          </header>

          <form class="flex flex-col gap-2 p-2" @submit.prevent="handleSubmit">
            <label class="text-label">Organization Name</label>
            <input v-model="form.name" type="text" placeholder="Enter organization name">

            <label class="text-label">Organization ID</label>
            <input :value="organization?.id ?? ''" type="text" class="cursor-not-allowed bg-muted" readonly>

            <label class="text-label">Created At</label>
            <input :value="organization?.createdAt" type="text" class="cursor-not-allowed bg-muted" readonly>

            <label class="text-label">Last Updated</label>
            <input :value="organization?.updatedAt" type="text" class="cursor-not-allowed bg-muted" readonly>

            <label class="text-label">Default User Role</label>
            <select v-model="defaultRole">
              <option v-for="role in assignableRoles" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>

            <button class="btn-primary md:self-start" type="submit">
              <Icon name="ph:check-circle" size="20" />
              <span>Save Changes</span>
            </button>
          </form>
        </section>
      </div>

      <div class="flex flex-col gap-2 md:w-1/2">
        <section class="flex flex-col">
          <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
            <h4>
              Projects
            </h4>
            <p class="text-caption text-muted-foreground">
              Manage projects associated with this organization.
            </p>
          </header>

          <ul class="scroll-area flex max-h-52 flex-col items-start gap-2 overflow-y-auto">
            <li v-for="project in projectsFromOrg" :key="project.id" class="card navigation-group text-label w-full min-w-0 justify-between">
              <div class="flex min-w-0 flex-col gap-1 md:w-2/3">
                <span class="w-full min-w-0 truncate font-semibold md:w-40">
                  {{ project.name }}
                </span>
                <span class="min-w-0 max-w-full truncate text-xs text-muted-foreground md:max-w-52">
                  {{ project.description || "No description provided." }}
                </span>
              </div>

              <div class="navigation-group justify-end md:w-1/3">
                <NuxtLink :to="`/admin/${project.id}`" class="btn">
                  <Icon name="ph:eye-bold" size="15" />
                </NuxtLink>
                <NuxtLink :to="`/admin/${project.id}/settings`" class="btn">
                  <Icon name="ph:gear-bold" size="15" />
                </NuxtLink>
                <button class="btn" @click="project.id && handleDeleteProject(project.id)">
                  <Icon name="ph:trash-bold" size="15" />
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="flex flex-col">
          <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
            <h4>
              Current Users
            </h4>
            <p class="text-caption text-muted-foreground">
              Manage roles and permissions for organization members.
            </p>
          </header>

          <ul class="scroll-area flex max-h-52 flex-col items-start gap-2 overflow-y-auto">
            <li v-for="orgUser in usersWithRoles" :key="orgUser.id" class="card navigation-group text-label w-full min-w-0 justify-between">
              <div class="flex min-w-0 flex-col gap-1 md:w-2/3">
                <span class="w-full min-w-0 truncate font-semibold md:w-40">
                  {{ orgUser.name }}
                </span>
                <span class="min-w-0 max-w-full truncate text-xs text-muted-foreground md:max-w-52">
                  Role: {{ Array.isArray(orgUser.role) ? orgUser.role.join(", ") : orgUser.role }}
                </span>
              </div>

              <div class="flex min-w-0 max-w-full flex-col gap-1 text-muted-foreground md:w-1/3">
                <span class="truncate text-xs">{{ orgUser.id }}</span>
                <span class="truncate text-xs">{{ orgUser.email }}</span>
              </div>

              <div v-if="orgUser.role !== 'owner' && ['owner'].includes(currentUserRole)" class="navigation-group justify-end">
                <select v-model="userRoles[orgUser.id ?? '']" class="min-w-[100px]">
                  <option v-for="role in assignableRoles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
                <button class="btn" @click="orgUser.id && handleUpdateMemberRole(orgUser.id, userRoles[orgUser.id])">
                  <Icon name="ph:check-bold" size="15" />
                </button>
                <button v-if="currentUserRole === 'owner'" class="btn" @click="orgUser.id && handleRemoveMember(orgUser.id)">
                  <Icon name="ph:x-bold" size="15" />
                </button>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <section class="md:navigation-group flex flex-col gap-2 p-2 md:justify-between">
      <header class="flex flex-col items-center text-center md:items-start md:text-start">
        <h5>
          Invite Members
        </h5>
        <p class="text-caption text-muted-foreground">
          Generate an invitation link to invite new users to this organization.
        </p>
      </header>

      <div class="flex flex-col gap-2 md:flex-row-reverse">
        <button class="btn-primary" @click="handleCreateInvite">
          <Icon name="ph:link" size="20" />
          <span>Create Invite Link</span>
        </button>

        <div v-if="inviteLink" class="relative">
          <input type="text" :value="inviteLink" readonly class="pr-10">
          <button class="absolute inset-y-0 right-0 flex flex-row items-center pr-2 text-muted-foreground">
            <Icon name="ph:copy" size="20" @click="copyInviteLink" />
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

const form = ref({
  name: props.organization?.name || "",
})

const roles: { value: Role, label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
]

const projectsStore = useProjectsStore()
const userStore = useUserStore()
const organizationStore = useOrganizationStore()

const { projects } = storeToRefs(projectsStore)
const { user } = storeToRefs(userStore)
const { inviteLink } = storeToRefs(organizationStore)

const defaultRole = ref<Role>("member")
const userRoles = ref<Record<string, Role>>({})
const assignableRoles = roles.filter(r => r.value !== "owner")

const currentUserRole = computed(() => {
  return props.organization?.memberships?.find(m => m.userId === user.value?.id)?.role ?? "member"
})

const projectsFromOrg = computed(() => {
  return projects.value.filter(project =>
    project.organizationId === props.organization?.id
    && typeof project.name === "string",
  )
})

const usersWithRoles = computed(() => {
  if (!props.organization?.memberships)
    return []

  return props.organization.memberships
    .filter((m): m is Required<UserOrganizationMembershipType> => !!m.user)
    .map(m => ({
      name: m.user!.name,
      id: m.user!.id,
      email: m.user!.email,
      role: m.role,
    }))
})

async function handleUpdateMemberRole(memberId: string, newRole: Role) {
  if (!props.organization?.id)
    return
  try {
    await organizationStore.updateOrganizationMember(memberId, newRole, props.organization.id)
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to update member role", error)
  }
}

async function handleRemoveMember(memberId: string) {
  if (!confirm("Are you sure you want to remove this member?"))
    return
  if (!props.organization?.id) {
    console.error("Organization ID is missing")
    return
  }
  try {
    await organizationStore.removeOrganizationMember(memberId, props.organization.id)
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to remove member", error)
  }
}

function handleCreateInvite() {
  organizationStore.createInviteLink()
}

function copyInviteLink() {
  const link = organizationStore.inviteLink
  if (link) {
    navigator.clipboard.writeText(link)
  }
}

async function handleSubmit() {
  if (!props.organization)
    return

  try {
    await organizationStore.updateOrganization(props.organization.id, {
      id: props.organization.id,
      name: form.value.name,
    })
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to update organization:", error)
  }
}

async function handleDeleteProject(projectId: string) {
  try {
    await projectsStore.deleteProject(projectId)
  }
  catch (error: any) {
    console.error("Failed to delete project:", error)
  }
}

onMounted(async () => {
  await projectsStore.getProjects()
})

watch(() => props.organization, (newOrg) => {
  form.value.name = newOrg?.name || ""
})

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
