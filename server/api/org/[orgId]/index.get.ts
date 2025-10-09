import db from "#server/lib/db"
import { getUserFromSession, requireOrgRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")
  if (!orgId) {
    throw createError({ statusCode: 400, message: "Organization ID is required" })
  }

  await requireOrgRole(sessionUser.id, orgId, ["owner", "admin", "member"])

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      projects: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
        },
        orderBy: { name: "asc" },
      },
    },
  })
  if (!organization) {
    throw createError({ statusCode: 404, message: "Organization not found" })
  }

  const currentUserMembership = organization.memberships.find(m => m.userId === sessionUser.id)

  return {
    id: organization.id,
    name: organization.name,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
    role: currentUserMembership?.role,
    members: organization.memberships.map(m => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
      joinedAt: m.createdAt,
    })),
    projects: organization.projects,
  }
})
