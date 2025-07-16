import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

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

  const membership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: sessionUser.id!,
        organizationId,
      },
    },
    select: {
      role: true,
    },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }
  if (membership.role !== "owner" && membership.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  const updatedOrganization = await db.organization.update({
    where: { id: organizationId },
    data: {
      name: body.name,
    },
  })

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "organization.update",
      resource: `Organization:${organizationId}`,
      metadata: {
        newName: body.name,
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "Organization updated successfully", updatedOrganization }
})
