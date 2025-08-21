<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <h2 class="border-b py-2">
      Organization
    </h2>

    <section class="flex flex-col">
      <div class="md:navigation-group gap-2 border-b p-2">
        <header class="flex flex-col gap-2">
          <h4>
            Organization Details
          </h4>
          <p class="text-info">
            Manage organization details and settings.
          </p>
        </header>

        <p v-if="orgStore.error" class="text-warning">
          {{ orgStore.error }}
        </p>
      </div>

      <!-- Organization Details -->
      <div v-for="(field, index) in orgFields" :key="index" class="md:navigation-group flex flex-col justify-between gap-2 border-b p-2 md:px-10">
        <div class="flex flex-col items-start justify-center gap-1 text-start">
          <h5>
            {{ field.label }}
          </h5>
          <p v-if="field.description" class="text-info">
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
          <button class="btn" aria-label="Save Changes" @click="field.onSave">
            <icon :name="saveIcon.icon.value" size="20" />
          </button>
        </div>

        <span v-else class="navigation-group justify-end">{{ field.value }}</span>
      </div>

      <!-- Organization Projects List -->
      <section v-if="isOwner || isAdmin" class="flex flex-col justify-between border-b p-2 md:px-10">
        <h5>
          Organization Projects
        </h5>

        <ul class="scroll-area flex max-h-52 flex-col items-start gap-1 overflow-y-auto">
          <li v-for="project in projectsFromOrg" :key="project.id" class="card navigation-group w-full justify-between">
            <div class="flex flex-col gap-1 truncate">
              <span>{{ project.name }}</span>
              <span class="text-info">{{ project.description || "No description provided." }}</span>
            </div>

            <nav class="navigation-group justify-end" aria-label="Organization Project Actions">
              <nuxt-link :to="`/admin/${project.slug}`" class="btn">
                <icon name="ph:eye-bold" size="15" />
              </nuxt-link>
              <nuxt-link :to="`/admin/${project.slug}/settings`" class="btn">
                <icon name="ph:gear-bold" size="15" />
              </nuxt-link>
            </nav>
          </li>
        </ul>
      </section>

      <!-- Organization Members List -->
      <section class="flex flex-col justify-between border-b p-2 md:px-10">
        <h5>
          Organization Members
        </h5>

        <ul class="scroll-area flex max-h-52 flex-col items-start gap-1 overflow-y-auto">
          <li v-for="orgUser in usersFromOrg" :key="orgUser.id" class="card navigation-group w-full justify-between overflow-hidden">
            <div class="flex min-w-0 flex-row items-center gap-2">
              <img :src="orgUser.image ?? undefined" alt="Avatar" class="hidden size-10 rounded-full border-2 md:block">
              <div class="flex min-w-0 flex-col">
                <span class="truncate">{{ orgUser.name }}</span>
                <span class="text-info truncate">Role: {{ orgUser.role }}</span>
                <span class="text-info truncate">{{ orgUser.id }}</span>
              </div>
            </div>

            <nav v-if="isOwner && orgUser.id !== userStore.user?.id" class="navigation-group justify-end" aria-label="Organization Member Actions">
              <select v-model="userRoles[orgUser.id]">
                <option v-for="role in roles.filter(r => r.value !== 'owner')" :key="role.value" :value="role.value" class="capitalize">
                  {{ role.label }}
                </option>
              </select>

              <button class="btn" aria-label="Update Member Role" @click="handleUpdateMemberRole(orgUser.id, userRoles[orgUser.id] || 'member')">
                <icon name="ph:floppy-disk-bold" size="15" />
              </button>
              <button v-if="isOwner && orgUser.role !== 'owner'" class="btn" aria-label="Remove Member" @click="handleRemoveMember(orgUser.id)">
                <icon name="ph:x-bold" size="15" />
              </button>
            </nav>
          </li>
        </ul>
      </section>
    </section>

    <!-- Invite Members -->
    <section v-if="isOwner || isAdmin" class="md:navigation-group flex flex-col items-end justify-between gap-2 border-b p-2 md:px-10" aria-label="Invite Members">
      <header class="flex flex-col gap-1">
        <h5>
          Invite Members
        </h5>
        <p class="text-info">
          Generate an invitation link to invite new users to this organization.
        </p>
      </header>

      <div class="navigation-group">
        <p v-if="inviteError" class="text-warning">
          {{ inviteError }}
        </p>
        <p v-if="inviteSuccess" class="text-success">
          {{ inviteSuccess }}
        </p>

        <button class="btn-primary" aria-label="Create Invite Link" @click="handleCreateInvite">
          <icon name="ph:link" size="20" />
          <span>Copy Invite Link</span>
        </button>
      </div>
    </section>

    <!-- Danger Zone -->
    <section v-if="isOwner" class="flex flex-col">
      <header class="flex flex-col items-start gap-1 border-b p-2 text-start">
        <h4>
          Danger Zone
        </h4>
        <p class="text-info">
          This section contains actions that can significantly affect your account. Please proceed with caution.
        </p>
      </header>

      <nav class="md:navigation-group flex flex-col items-end justify-between gap-2 border-b p-2 md:px-10" aria-label="Leave Organization">
        <header class="flex flex-col gap-1">
          <h5>
            Leave Organization
          </h5>
          <p class="text-warning">
            This action is irreversible. You will no longer have access to this organization.
          </p>
        </header>

        <div class="navigation-group">
          <p v-if="leaveOrgError" class="text-warning">
            {{ leaveOrgError }}
          </p>

          <button class="btn-danger" aria-label="Leave Organization" @click="handleLeaveOrg">
            <icon name="ph:sign-out-bold" size="20" />
            <span>Leave Organization</span>
          </button>
        </div>
      </nav>

      <nav class="md:navigation-group flex flex-col items-end justify-between gap-2 border-b p-2 md:px-10" aria-label="Delete Organization">
        <header class="flex flex-col gap-1">
          <h5>
            Delete Organization
          </h5>
          <p class="text-warning">
            This action is irreversible. All data associated with this organization will be permanently deleted.
          </p>
        </header>

        <div class="navigation-group">
          <p v-if="deleteOrgError" class="text-warning">
            {{ deleteOrgError }}
          </p>

          <button class="btn-danger" aria-label="Delete Organization" @click="handleDeleteOrg">
            <icon name="ph:network-x-bold" size="20" />
            <span>Delete Organization</span>
          </button>
        </div>
      </nav>
    </section>
  </div>
</template>

<script setup lang="ts">
import auth from "~/lib/middleware/auth"
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useProjectsStore } from "~/lib/stores/projects-store"
import { useUserStore } from "~/lib/stores/user-store"
import { formatDate } from "~/lib/utils"

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
]

const router = useRouter()
const { createActionHandler } = useActionIcon()
const userStore = useUserStore()
const orgStore = useOrganizationStore()
const projectsStore = useProjectsStore()

const userRoles = ref<Record<string, Role>>({})
const leaveOrgError = ref<string | null>(null)
const deleteOrgError = ref<string | null>(null)
const inviteError = ref<string | null>(null)
const inviteSuccess = ref<string | null>(null)

const isOwner = computed(() => orgStore.activeOrg?.memberships?.find(m => m.userId === userStore.user?.id)?.role === "owner")
const isAdmin = computed(() => orgStore.activeOrg?.memberships?.find(m => m.userId === userStore.user?.id)?.role === "admin")

const projectsFromOrg = computed(() => {
  return projectsStore.projects.filter(project => project.orgId === orgStore.activeOrg?.id)
})

const usersFromOrg = computed(() => {
  return (orgStore.activeOrg?.memberships || []).map(m => ({
    id: m.user?.id ?? "",
    name: m.user?.name ?? "",
    email: m.user?.email ?? "",
    image: m.user?.image ?? "",
    role: m.role ?? "",
  }))
})

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

const saveIcon = createActionHandler("ph:floppy-disk-bold")
const copyIcon = orgFields.map(field =>
  field.copyable ? createActionHandler("ph:copy-bold") : null,
)

async function handleCreateInvite() {
  inviteError.value = null
  inviteSuccess.value = null

  try {
    const link = await orgStore.createInviteLink()
    navigator.clipboard.writeText(link)
    inviteSuccess.value = "Invite link copied to clipboard!"
  }
  catch (error: any) {
    console.error("Failed to create invite link:", error)
    inviteError.value = error.message
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
    orgStore.error = error.message
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
    orgStore.error = error.message
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
    saveIcon.triggerSuccess()
  }
  catch (error: any) {
    console.error("Failed to update organization:", error)
    orgStore.error = error.message
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
    console.error("Failed to leave organization:", error)
    leaveOrgError.value = error.message
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
    console.error("Failed to delete organization:", error)
    deleteOrgError.value = error.message
  }
}

watch(usersFromOrg, (users) => {
  userRoles.value = Object.fromEntries(users.map(u => [u.id, u.role]))
}, { immediate: true })

useHead({
  title: "Organization - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/admin/organization" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Organization - SecretKeepR",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
})

definePageMeta({
  layout: "admin",
  middleware: auth,
})
</script>
