import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "#server/lib/utils"
import { updateOrgSchema } from "#shared/schemas/org"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")
  const body = await readBody(event)
  if (!orgId) {
    throw createError({ statusCode: 400, message: "Organization ID is required" })
  }

  const { name } = updateOrgSchema.parse(body)

  await requireOrgRole(sessionUser.id, orgId, ["owner", "admin"])

  const existingOrg = await db.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true },
  })
  if (!existingOrg) {
    throw createError({ statusCode: 404, message: "Organization not found" })
  }

  const organization = await db.organization.update({
    where: { id: orgId },
    data: { name },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (Object.keys({ name }).length > 0) {
    await createAuditLog({
      userId: sessionUser.id,
      orgId,
      action: "update",
      resource: "organization",
      metadata: {
        changes: { name },
        previousName: existingOrg.name,
      },
      req: event.node.req,
    })
  }

  return organization
})
