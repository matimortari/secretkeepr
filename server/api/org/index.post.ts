import db from "#server/lib/db"
import { createAuditLog, getUserFromSession } from "#server/lib/utils"
import { createOrgSchema } from "#shared/schemas/org"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const body = await readBody(event)

  const { name } = createOrgSchema.parse(body)

  const organization = await db.organization.create({
    data: {
      name,
      memberships: {
        create: {
          userId: sessionUser.id,
          role: "owner",
        },
      },
    },
    include: {
      memberships: {
        where: { userId: sessionUser.id },
        select: { role: true },
      },
    },
  })
  if (!sessionUser.activeOrgId) {
    await db.user.update({
      where: { id: sessionUser.id },
      data: { activeOrgId: organization.id },
    })
  }

  await createAuditLog({
    userId: sessionUser.id,
    orgId: organization.id,
    action: "create",
    resource: "organization",
    metadata: { organizationName: name },
    req: event.node.req,
  })

  return {
    id: organization.id,
    name: organization.name,
    role: organization.memberships[0].role,
    createdAt: organization.createdAt,
  }
})
