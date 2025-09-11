import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)
  if (body.name !== undefined) {
    if (typeof body.name !== "string") {
      throw createError({ statusCode: 400, statusMessage: "Invalid name" })
    }
    body.name = body.name.trim()
    if (body.name.length === 0 || body.name.length > 30) {
      throw createError({ statusCode: 400, statusMessage: "Name must be 1-30 characters" })
    }
  }

  const updatedUser = await db.user.update({
    where: { id: sessionUser.id },
    data: {
      name: body.name,
    },
  })

  return { message: "User updated successfully", user: updatedUser }
})
