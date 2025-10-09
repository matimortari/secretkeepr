import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const query = getQuery(event)
  const orgId = query.orgId as string

  const orgMemberships = await db.organizationMembership.findMany({
    where: { userId: sessionUser.id },
    select: { orgId: true, role: true },
  })

  const orgIds = orgMemberships.map(m => m.orgId)
  if (orgIds.length === 0) {
    return { projects: [] }
  }

  // Build where clause - if orgId is provided, filter by it (and validate access)
  let whereClause: any = {
    orgId: { in: orgIds },
  }
  if (orgId) {
    if (!orgIds.includes(orgId)) {
      throw createError({ statusCode: 403, message: "Access denied to organization" })
    }
    whereClause = { orgId }
  }

  const projects = await db.project.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      orgId: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
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
      },
      _count: {
        select: {
          secrets: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  const projectsWithRole = projects.map((project) => {
    const userMembership = project.members.find(m => m.userId === sessionUser.id)
    const orgMembership = orgMemberships.find(m => m.orgId === project.orgId)

    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      organization: project.organization,
      role: userMembership?.role || null,
      orgRole: orgMembership?.role || null,
      memberCount: project.members.length,
      secretCount: project._count.secrets,
      isMember: !!userMembership,
    }
  })

  return { projects: projectsWithRole }
})
