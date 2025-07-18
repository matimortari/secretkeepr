import { nanoid } from "nanoid"
import db from "~/lib/db"
import { getUserFromSession, requireOrgRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const membership = await db.userOrganizationMembership.findFirst({
    where: { userId: sessionUser.id },
    select: {
      organizationId: true,
      role: true,
    },
  })
  if (!membership?.organizationId) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }

  await requireOrgRole(sessionUser.id!, membership.organizationId, ["owner"])

  const token = nanoid()

  await db.invitation.create({
    data: {
      token,
      organizationId: membership.organizationId,
      role: "member",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  })

  function getBaseUrl(event: any) {
    const protocol = event.req.headers["x-forwarded-proto"] || "http"
    const host = event.req.headers.host
    return `${protocol}://${host}`
  }

  return { message: "Invitation link created successfully", inviteLink: `${getBaseUrl(event)}/setup/invite?token=${token}` }
})
