import db from "~~/server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const organizationId = event.context.params?.id
  if (!organizationId || typeof organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const body = await readBody(event)
  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization name is required" })
  }

  await requireOrgRole(sessionUser.id!, organizationId, ["owner"])

  const updatedOrganization = await db.organization.update({
    where: { id: organizationId },
    data: {
      name: body.name,
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId,
    action: "organization.update",
    resource: `Organization: ${organizationId}`,
    metadata: {
      name: updatedOrganization.name,
    },
    req: event.node.req,
  })

  return { message: "Organization updated successfully", updatedOrganization }
})
