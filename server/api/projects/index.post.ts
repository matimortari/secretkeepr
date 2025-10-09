import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, normalizeSlug, requireOrgRole } from "#server/lib/utils"
import { createProjectSchema } from "#shared/schemas/project"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const body = await readBody(event)

  const { name, slug, description } = createProjectSchema.parse(body)

  const query = getQuery(event)
  const orgId = (query.orgId as string) || sessionUser.activeOrgId
  if (!orgId) {
    throw createError({ statusCode: 400, message: "Organization ID is required. Provide orgId in query or set an active organization" })
  }

  await requireOrgRole(sessionUser.id, orgId, ["owner", "admin"])
  const finalSlug = normalizeSlug(slug || name)

  const project = await db.project.create({
    data: {
      name,
      slug: finalSlug,
      description,
      orgId,
      members: {
        create: {
          userId: sessionUser.id,
          role: "owner",
        },
      },
    },
    include: {
      organization: {
        select: { id: true, name: true },
      },
      members: {
        where: { userId: sessionUser.id },
        select: { role: true },
      },
    },
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId,
    action: "create",
    resource: "project",
    metadata: { projectId: project.id, projectName: name, projectSlug: finalSlug },
    req: event.node.req,
  })

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    createdAt: project.createdAt,
    organization: project.organization,
    role: project.members[0].role,
  }
})
