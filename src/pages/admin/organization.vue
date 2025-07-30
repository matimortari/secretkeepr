<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <h2 class="border-b py-2">
      Organization
    </h2>

    <form class="flex flex-col" @submit.prevent="handleSubmit">
      <nav class="md:navigation-group flex flex-col items-center justify-between border-b p-2 text-center md:text-start">
        <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
          <h4>
            Organization Details
          </h4>
          <p class="text-caption">
            Manage organization details and settings.
          </p>
        </header>

        <div class="flex flex-col gap-2 md:flex-row md:items-center">
          <p v-if="orgStore.error" class="text-caption text-danger-foreground">
            {{ orgStore.error }}
          </p>

          <button class="btn-primary md:self-start" type="submit" :disabled="!isOwner">
            <Icon name="ph:check-circle" size="20" />
            <span>Save Changes</span>
          </button>
        </div>
      </nav>

      <section class="flex flex-col px-8">
        <div
          v-for="(field, index) in orgFields" :key="index"
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

          <div v-if="field.type === 'input'" class="md:navigation-group flex flex-col gap-1">
            <input
              type="text"
              :value="field.model"
              placeholder="Enter value"
              required
              @input="field.update && $event.target && field.update(($event.target as HTMLInputElement).value)"
            >
            <div class="btn" @click="field.onSave">
              <Icon name="ph:check-bold" size="20" />
              <span>Save</span>
            </div>
          </div>

          <div v-else-if="field.copyable" class="md:navigation-group flex flex-col gap-1">
            <span class="text-caption">{{ field.value }}</span>
            <div class="btn" @click="copyToClipboard(field.value?.value || '')">
              <Icon name="ph:clipboard-bold" size="20" />
              <span>Copy</span>
            </div>
          </div>

          <span v-else class="text-caption md:navigation-group flex flex-col gap-1">{{ field.value }}</span>
        </div>
      </section>
    </form>

    <section class="flex flex-col justify-between border-b p-4">
      <h4>
        Organization Members
      </h4>

      <ul class="scroll-area flex max-h-52 flex-col items-start gap-1 overflow-y-auto">
        <li v-for="orgUser in usersWithRoles" :key="orgUser.id" class="card navigation-group w-full min-w-0 justify-between">
          <div class="flex min-w-0 flex-col gap-1 md:w-2/3">
            <span class="w-full min-w-0 truncate font-semibold md:w-40">{{ orgUser.name }}</span>
            <span class="text-caption min-w-0 max-w-full truncate md:max-w-52">Role: {{ orgUser.role }}</span>
          </div>

          <nav v-if="isOwner && orgUser.id !== userStore.user?.id" class="navigation-group justify-end">
            <div class="text-caption flex min-w-0 max-w-full flex-col gap-1 md:w-1/3">
              <span class="truncate text-sm">{{ orgUser.id }}</span>
              <span class="truncate text-sm">{{ orgUser.email }}</span>
            </div>

            <select v-model="userRoles[orgUser.id]" class="min-w-[100px]">
              <option v-for="role in roles" :key="role.value" :value="role.value" class="capitalize">
                {{ role.label }}
              </option>
            </select>

            <button class="btn" @click="handleUpdateMemberRole(orgUser.id, userRoles[orgUser.id])">
              <Icon name="ph:check-bold" size="15" />
            </button>
            <button v-if="isOwner && orgUser.role !== 'owner'" class="btn" @click="handleRemoveMember(orgUser.id)">
              <Icon name="ph:x-bold" size="15" />
            </button>
          </nav>
        </li>
      </ul>
    </section>

    <section v-if="isOwner || isAdmin" class="flex flex-col justify-between border-b p-4">
      <h4>
        Organization Projects
      </h4>

      <ul class="scroll-area flex max-h-52 flex-col items-start gap-1 overflow-y-auto">
        <li v-for="project in projectsFromOrg" :key="project.id" class="card navigation-group w-full min-w-0 justify-between">
          <div class="flex min-w-0 flex-col gap-1 md:w-2/3">
            <span class="w-full min-w-0 truncate font-semibold md:w-40">
              {{ project.name }}
            </span>
            <span class="text-caption min-w-0 max-w-full truncate md:max-w-52">
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

    <section v-if="isOwner || isAdmin" class="md:navigation-group flex flex-col items-center justify-between border-b p-4 px-10 text-center md:items-start md:text-start">
      <div class="flex flex-col gap-1">
        <h6>
          Invite Members
        </h6>
        <p class="text-caption">
          Generate an invitation link to invite new users to this organization.
        </p>
      </div>

      <div class="md:navigation-group flex flex-col gap-2">
        <p v-if="inviteError" class="text-caption text-danger-foreground">
          {{ inviteError }}
        </p>
        <p v-if="inviteSuccess" class="text-caption text-success-foreground">
          {{ inviteSuccess }}
        </p>

        <button class="btn-primary" @click="handleCreateInvite">
          <Icon name="ph:link" size="20" />
          <span>Copy Invite Link</span>
        </button>
      </div>
    </section>

    <AuditLogs :logs="logs" />

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
            Leave Organization
          </h6>
          <p class="text-caption text-danger-foreground">
            This action is irreversible. You will no longer have access to this organization.
          </p>
        </div>

        <div class="navigation-group">
          <p v-if="leaveOrgError" class="text-caption text-danger-foreground">
            {{ leaveOrgError }}
          </p>
          <button class="btn-danger" @click="handleLeaveOrg">
            <Icon name="ph:sign-out-bold" size="20" />
            <span>Leave Organization</span>
          </button>
        </div>
      </section>

      <section class="md:navigation-group flex flex-col items-center justify-between border-b p-4 px-10 text-center md:items-start md:text-start">
        <div class="flex flex-col gap-1">
          <h6>
            Delete Organization
          </h6>
          <p class="text-caption text-danger-foreground">
            This action is irreversible. All data associated with this organization will be permanently deleted.
          </p>
        </div>

        <div v-if="deleteOrgError" class="text-caption text-danger-foreground">
          {{ deleteOrgError }}
        </div>
        <div class="navigation-group">
          <button class="btn-danger" @click="handleDeleteOrg">
            <Icon name="ph:network-x-bold" size="20" />
            <span>Delete Organization</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import auth from "~/lib/middleware/auth"
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"
import { copyToClipboard, formatDate } from "~/lib/utils"

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
]

const router = useRouter()
const userStore = useUserStore()
const orgStore = useOrganizationStore()
const projectsStore = useProjectsStore()

const userRoles = ref<Record<string, Role>>({})
const leaveOrgError = ref<string | null>(null)
const deleteOrgError = ref<string | null>(null)
const inviteError = ref<string | null>(null)
const inviteSuccess = ref("")

const logs = computed(() => orgStore.activeOrg?.auditLogs || [])
const isOwner = computed(() => orgStore.activeOrg?.memberships?.find(m => m.userId === userStore.user?.id)?.role === "owner")
const isAdmin = computed(() => orgStore.activeOrg?.memberships?.find(m => m.userId === userStore.user?.id)?.role === "admin")

const projectsFromOrg = computed(() => {
  return projectsStore.projects.filter(project => project.orgId === orgStore.activeOrg?.id)
})

const usersWithRoles = computed(() => {
  return (orgStore.activeOrg?.memberships || []).map(m => ({
    id: m.user?.id ?? "",
    name: m.user?.name ?? "",
    email: m.user?.email ?? "",
    role: m.role ?? "",
  }))
})

async function handleCreateInvite() {
  inviteError.value = ""
  inviteSuccess.value = ""
  try {
    const link = await orgStore.createInviteLink()
    navigator.clipboard.writeText(link)
    inviteSuccess.value = "Invite link copied to clipboard!"
  }
  catch (error: any) {
    inviteError.value = error?.message || "Failed to create invite link."
    console.error("Failed to create invite link:", error)
  }
}

async function handleUpdateMemberRole(memberId: string, newRole: Role) {
  orgStore.error = null
  if (!orgStore.activeOrg?.id)
    return

  try {
    await orgStore.updateOrgMember(memberId, newRole, orgStore.activeOrg?.id)
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to update member role:", error)
    orgStore.error = error?.message || "Failed to update member role."
  }
}

async function handleRemoveMember(memberId: string) {
  orgStore.error = null
  if (!orgStore.activeOrg?.id)
    return
  if (!confirm("Are you sure you want to remove this member?"))
    return

  try {
    await orgStore.removeOrgMember(memberId, orgStore.activeOrg?.id)
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to remove member:", error)
    orgStore.error = error?.message || "Failed to remove member."
  }
}

async function handleSubmit() {
  orgStore.error = null
  if (!orgStore.activeOrg?.id)
    return

  try {
    await orgStore.updateOrg(orgStore.activeOrg?.id, {
      id: orgStore.activeOrg?.id,
      name: orgStore.activeOrg?.name || "",
    })
    await userStore.getUser()
  }
  catch (error: any) {
    console.error("Failed to update organization:", error)
    orgStore.error = error?.message || "Failed to update organization."
  }
}

async function handleLeaveOrg() {
  leaveOrgError.value = null
  if (!orgStore.activeOrg?.id || !userStore.user?.id) {
    leaveOrgError.value = "Missing organization or user ID."
    return
  }
  if (!confirm("Are you sure you want to leave this organization? This action cannot be undone."))
    return

  try {
    await orgStore.removeOrgMember(userStore.user.id, orgStore.activeOrg?.id)
    await router.push("/setup/create-org")
  }
  catch (error: any) {
    console.error("Leave org error:", error)
    leaveOrgError.value = error.message || "An error occurred while leaving the organization."
  }
}

async function handleDeleteOrg() {
  deleteOrgError.value = null
  const orgId = orgStore.activeOrg?.id
  if (!orgId)
    return
  if (!confirm("Are you sure you want to delete this organization? This action cannot be undone."))
    return

  try {
    const result = await orgStore.deleteOrg(orgId)
    if (result?.message === "Organization deleted successfully") {
      await userStore.getUser()
      if (!userStore.user?.memberships?.length) {
        await router.push("/setup/create-org")
      }
      else {
        await router.push("/admin/projects")
      }
    }
  }
  catch (error: any) {
    console.error("Delete org error:", error)
    deleteOrgError.value = error.message || "An error occurred while deleting the organization."
  }
}

const orgFields = [
  {
    label: "Organization Name",
    description: "The name of your organization.",
    type: "input",
    model: computed(() => orgStore.activeOrg?.name || ""),
    update: (value: string) => {
      if (orgStore.activeOrg)
        orgStore.activeOrg.name = value
    },
    onSave: handleSubmit,
    editable: isOwner,
  },
  {
    label: "Organization ID",
    description: "This ID uniquely identifies your organization.",
    value: computed(() => orgStore.activeOrg?.id),
    copyable: true,
  },
  {
    label: "Created At",
    description: "When your organization was created.",
    value: computed(() => formatDate(orgStore.activeOrg?.createdAt)),
  },
  {
    label: "Updated At",
    description: "Last update time for your organization.",
    value: computed(() => formatDate(orgStore.activeOrg?.updatedAt)),
  },
]

onMounted(() => {
  if (orgStore.activeOrg?.id) {
    orgStore.getAuditLogs(orgStore.activeOrg?.id)
    projectsStore.getProjects()
  }
  userStore.getUser()
})

watch(() => orgStore.activeOrg?.id, async (orgId) => {
  if (orgId) {
    await orgStore.getAuditLogs(orgId)
    await projectsStore.getProjects()
  }
}, { immediate: true })

watch(usersWithRoles, (users) => {
  userRoles.value = Object.fromEntries(users.map(u => [u.id, u.role]))
}, { immediate: true })

useHead({
  title: "Organization – SecretKeepR",
  link: [
    { rel: "canonical", href: "https://secretkeepr.vercel.app/admin/organization" },
    { rel: "icon", href: "/favicon.ico" },
  ],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Organization – SecretKeepR",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
})

definePageMeta({
  layout: "admin",
  middleware: auth,
})
</script>
