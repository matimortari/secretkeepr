import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const user = await getUserFromSession(event)

  const body = await readBody(event)
  if (!body.orgId || typeof body.orgId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  await db.user.update({
    where: { id: user.id },
    data: { activeOrgId: body.orgId },
  })

  setCookie(event, "active_org_id", body.orgId, { httpOnly: true, path: "/" })

  return { success: true }
})
