import { randomUUID } from "node:crypto"
import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "#server/lib/utils"
import { inviteMemberSchema } from "#shared/schemas/org"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")!
  const body = await readBody(event)

  const { email, role } = inviteMemberSchema.parse(body)

  await requireOrgRole(sessionUser.id, orgId, ["owner", "admin"])

  const userWithEmail = await db.user.findUnique({
    where: { email },
    include: {
      organizations: {
        where: { orgId },
      },
    },
  })
  if (userWithEmail && userWithEmail.organizations.length > 0) {
    throw createError({ statusCode: 400, statusMessage: "User is already a member of this organization" })
  }

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invitation = await db.invitation.create({
    data: {
      token,
      orgId,
      role,
      expiresAt,
    },
    include: {
      organization: {
        select: { name: true },
      },
    },
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId,
    action: "create",
    resource: "invitation",
    metadata: {
      invitedEmail: email,
      role,
      token,
    },
    req: event.node.req,
  })

  return {
    id: invitation.id,
    token: invitation.token,
    organizationName: invitation.organization.name,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
  }
})
