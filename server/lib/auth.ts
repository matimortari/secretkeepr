import type { H3Event } from "h3"
import { randomBytes } from "node:crypto"
import db from "#server/lib/db"

interface OAuthUserData {
  id: string
  name: string | null
  email: string
  image: string | null
  provider: "google" | "github" | "gitlab"
}

export async function handleOAuthUser(event: H3Event, userData: OAuthUserData) {
  const { id: providerAccountId, name, email, image, provider } = userData

  // Find existing account by provider
  let account = await db.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  })

  let user: {
    id: string
    name: string
    email: string
    image: string | null
    createdAt: Date
    updatedAt: Date
    apiToken: string | null
    activeOrgId: string | null
  } | undefined = account?.user

  // If no account, try to find existing user by email
  if (!user) {
    user = await db.user.findUnique({ where: { email } }) ?? undefined

    // If still no user, create one
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: name?.trim() || "",
          image: image || undefined,
          activeOrgId: null,
        },
      })
    }

    // Link provider account
    account = await db.account.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      update: {},
      create: { userId: user.id, provider, providerAccountId },
      include: { user: true },
    })
    user = account.user
  }

  // Generate new API token (32 bytes → 64 hex chars)
  const apiToken = randomBytes(32).toString("hex")
  await db.user.update({
    where: { id: user.id },
    data: { apiToken },
  })

  // Load memberships
  const memberships = await db.organizationMembership.findMany({
    where: { userId: user.id },
    include: { organization: true },
  })

  const organizations = memberships.map(m => ({
    role: m.role,
    organization: { id: m.organization.id, name: m.organization.name },
  }))

  // Load activeOrg, auto-reset activeOrgId if no membership found
  let activeOrg: null | any = null
  if (user.activeOrgId) {
    const activeMembership = memberships.find(m => m.orgId === user.activeOrgId)
    if (activeMembership) {
      const projects = await db.project.findMany({
        where: { orgId: user.activeOrgId },
        select: { id: true, name: true, slug: true },
      })

      activeOrg = {
        id: activeMembership.orgId,
        name: activeMembership.organization.name,
        role: activeMembership.role,
        projects,
      }
    }
    else {
      await db.user.update({ where: { id: user.id }, data: { activeOrgId: null } })
    }
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    organizations,
    activeOrg,
    apiToken,
  }

  await setUserSession(event, { user: sessionUser, loggedInAt: new Date() })

  return sendRedirect(event, "/admin/projects")
}
