<template>
  <div class="flex flex-col border-b">
    <div class="flex flex-col gap-2 border-b md:flex-row md:gap-8">
      <section class="flex flex-col gap-2 md:w-1/2">
        <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
          <h4>Organization Details</h4>
          <p class="text-caption">
            Manage organization details and settings.
          </p>
        </header>

        <form class="flex flex-col gap-2 p-2" @submit.prevent="handleSubmit">
          <label class="text-label">Organization Name</label>
          <input v-model="form.name" type="text" placeholder="Enter organization name">

          <span class="text-label" for="orgId">Organization ID: <span class="text-muted-foreground">{{ org?.id }}</span></span>
          <span class="text-label" for="createdAt">Created At: <span class="text-muted-foreground">{{ formatDate(org?.createdAt) }}</span></span>
          <span class="text-label" for="updatedAt">Last Updated: <span class="text-muted-foreground">{{ formatDate(org?.updatedAt) }}</span></span>

          <div class="flex flex-col gap-2 md:flex-row md:items-center">
            <button class="btn-primary md:self-start" type="submit" :disabled="!isOwner">
              <Icon name="ph:check-circle" size="20" />
              <span>Save Changes</span>
            </button>

            <p v-if="orgStore.error" class="text-sm text-danger-foreground">
              {{ orgStore.error }}
            </p>
          </div>
        </form>
      </section>

      <div class="flex flex-col gap-2 md:w-1/2">
        <section v-if="isOwner || isAdmin" class="flex flex-col">
          <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
            <h4>Projects</h4>
            <p class="text-caption">
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

              <nav class="navigation-group justify-end md:w-1/3">
                <NuxtLink :to="`/admin/${project.id}`" class="btn">
                  <Icon name="ph:eye-bold" size="15" />
                </NuxtLink>
                <NuxtLink :to="`/admin/${project.id}/settings`" class="btn">
                  <Icon name="ph:gear-bold" size="15" />
                </NuxtLink>
              </nav>
            </li>
          </ul>
        </section>

        <section class="flex flex-col">
          <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
            <h4>Organization Members</h4>
            <p class="text-caption">
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

              <nav v-if="orgUser.role !== 'owner' && ['owner'].includes(currentUserRole)" class="navigation-group justify-end">
                <select v-model="userRoles[orgUser.id ?? '']" class="min-w-[100px]">
                  <option v-for="role in assignableRoles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
                <button class="btn" @click="handleUpdateMemberRole(orgUser.id, userRoles[orgUser.id])">
                  <Icon name="ph:check-bold" size="15" />
                </button>
                <button v-if="currentUserRole === 'owner'" class="btn" @click="handleRemoveMember(orgUser.id)">
                  <Icon name="ph:x-bold" size="15" />
                </button>
              </nav>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <section v-if="isOwner || isAdmin" class="md:navigation-group flex flex-col gap-2 p-2 md:justify-between">
      <header class="flex flex-col items-center text-center md:items-start md:text-start">
        <h5>Invite Members</h5>
        <p class="text-caption">
          Generate an invitation link to invite new users to this organization.
        </p>
      </header>

      <div class="flex flex-col gap-2 md:flex-row">
        <p v-if="inviteError" class="text-caption flex items-center px-2 text-danger-foreground">
          {{ inviteError }}
        </p>
        <p v-if="inviteSuccess" class="text-caption flex items-center px-2 text-success-foreground">
          {{ inviteSuccess }}
        </p>

        <button class="btn-primary" @click="handleCreateInvite">
          <Icon name="ph:link" size="20" />
          <span>Copy Invite Link</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"
import { formatDate } from "~/lib/utils"

const props = defineProps<{
  org: OrganizationType | null
}>()

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
] satisfies { value: Role, label: string }[]

const assignableRoles = roles.filter(r => r.value !== "owner")

const projectsStore = useProjectsStore()
const userStore = useUserStore()
const orgStore = useOrganizationStore()

const { projects } = storeToRefs(projectsStore)
const { user } = storeToRefs(userStore)
const inviteError = ref("")
const inviteSuccess = ref("")

const form = ref({ name: props.org?.name || "" })
const userRoles = ref<Record<string, Role>>({})

const currentUserRole = computed(() =>
  props.org?.memberships?.find(m => m.userId === user.value?.id)?.role ?? "member",
)

const isOwner = computed(() => currentUserRole.value === "owner")
const isAdmin = computed(() => currentUserRole.value === "admin")

const projectsFromOrg = computed(() =>
  projects.value.filter(
    project =>
      project.orgId === props.org?.id
      && typeof project.name === "string",
  ),
)

const usersWithRoles = computed(() => {
  return props.org?.memberships?.filter((m): m is Required<UserOrgMembershipType> => !!m.user).map(m => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  })) ?? []
})

async function handleUpdateMemberRole(memberId: string, newRole: Role) {
  orgStore.error = ""
  if (!props.org?.id)
    return

  try {
    await orgStore.updateOrgMember(memberId, newRole, props.org.id)
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to update member role:", error)
  }
}

async function handleRemoveMember(memberId: string) {
  orgStore.error = ""
  if (!props.org?.id)
    return
  if (!confirm("Are you sure you want to remove this member?"))
    return

  try {
    await orgStore.removeOrgMember(memberId, props.org.id)
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to remove member:", error)
  }
}

async function handleCreateInvite() {
  inviteError.value = ""
  inviteSuccess.value = ""
  try {
    const link = await orgStore.createInviteLink()
    if (link) {
      await navigator.clipboard.writeText(link)
      inviteSuccess.value = "Invite link copied to clipboard!"
    }
    else {
      inviteError.value = "Failed to generate invite link."
    }
  }
  catch (error: any) {
    inviteError.value = error?.message || "Failed to copy invite link."
    console.error("Invite generation error:", error)
  }
}

async function handleSubmit() {
  orgStore.error = ""
  if (!props.org)
    return

  try {
    await orgStore.updateOrg(props.org.id, {
      id: props.org.id,
      name: form.value.name,
    })
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to update organization:", error)
  }
}

onMounted(() => {
  projectsStore.getProjects()
})

watch(() => props.org, (org) => {
  form.value.name = org?.name || ""
})

watch(usersWithRoles, (users) => {
  userRoles.value = Object.fromEntries(users.map(u => [u.id, u.role]))
}, { immediate: true })
</script>
