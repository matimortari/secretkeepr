import db from "#server/lib/db"
import { createAuditLog, getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)
  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization name is required" })
  }

  const newOrg = await db.organization.create({
    data: {
      name: body.name,
      memberships: {
        create: {
          userId: sessionUser.id!,
          role: "owner",
        },
      },
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    orgId: newOrg.id,
    action: "org.create",
    resource: `Organization: ${newOrg.id}`,
    metadata: {
      id: newOrg.id,
      name: newOrg.name,
    },
    req: event.node.req,
  })

  return { message: "Organization created successfully", newOrg }
})
