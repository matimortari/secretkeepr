import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, name: true, image: true, activeOrgId: true, apiToken: true, createdAt: true, updatedAt: true },
  })
  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" })
  }

  const memberships = await db.organizationMembership.findMany({
    where: { userId: user.id },
    include: { organization: true },
  })
  const organizations = memberships.map(m => ({
    id: m.orgId,
    name: m.organization.name,
    role: m.role,
  }))

  let activeOrg: null | any = null
  if (user.activeOrgId) {
    const membership = memberships.find(m => m.orgId === user.activeOrgId)
    if (membership) {
      const projects = await db.project.findMany({
        where: { orgId: user.activeOrgId },
        select: { id: true, name: true, slug: true },
      })
      activeOrg = {
        id: membership.orgId,
        name: membership.organization.name,
        role: membership.role,
        projects,
      }
    }
  }

  return { user, organizations, activeOrg }
})
