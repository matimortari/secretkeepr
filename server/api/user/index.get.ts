import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              memberships: {
                select: {
                  userId: true,
                  role: true,
                  user: { select: { id: true, name: true, image: true } },
                },
              },
            },
          },
        },
      },
      projects: {
        include: {
          project: {
            include: {
              members: {
                select: {
                  userId: true,
                  role: true,
                  user: { select: { id: true, name: true, image: true } },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" })
  }

  return user
})
