import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const orgId = event.context.params?.id
  if (!orgId || typeof orgId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const body = await readBody(event)
  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization name is required" })
  }
  body.name = body.name.trim()
  if (body.name.length === 0 || body.name.length > 50) {
    throw createError({ statusCode: 400, statusMessage: "Organization name must be 1-50 characters" })
  }

  await requireOrgRole(sessionUser.id!, orgId, ["owner"])

  const updatedOrg = await db.organization.update({
    where: { id: orgId },
    data: {
      name: body.name,
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    orgId,
    action: "org.update",
    resource: `Organization: ${orgId}`,
    metadata: {
      name: updatedOrg.name,
    },
    req: event.node.req,
  })

  return { message: "Organization updated successfully", updatedOrg }
})
