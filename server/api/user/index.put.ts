import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)
  if (body.name !== undefined && typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Invalid name" })
  }
  if (body.image !== undefined && typeof body.image !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Invalid image URL" })
  }

  const updatedUser = await db.user.update({
    where: { id: sessionUser.id },
    data: {
      name: body.name,
      image: body.image,
    },
  })

  return { message: "User updated successfully", user: updatedUser }
})
