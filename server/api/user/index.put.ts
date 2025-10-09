import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"
import { updateUserSchema } from "#shared/schemas/user"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true },
  })
  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" })
  }

  const body = await readBody(event)
  const { email, name, activeOrgId } = updateUserSchema.parse({
    ...body,
    email: body.email?.toLowerCase(),
    name: body.name?.trim(),
  })
  if (email && email !== user.email) {
    const existingUser = await db.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      throw createError({ statusCode: 409, message: "Email already in use" })
    }
  }

  // If activeOrgId is being updated, verify the user has access to that organization
  if (activeOrgId) {
    const membership = await db.organizationMembership.findFirst({
      where: {
        userId: sessionUser.id,
        orgId: activeOrgId,
      },
    })
    if (!membership) {
      throw createError({ statusCode: 403, message: "You don't have access to this organization" })
    }
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: { email, name, activeOrgId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      activeOrgId: true,
    },
  })

  return { user: updatedUser }
})
