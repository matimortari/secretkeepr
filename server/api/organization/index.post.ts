import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)
  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization name is required" })
  }

  const newOrganization = await db.organization.create({
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

  return { message: "Organization created successfully", newOrganization }
})
