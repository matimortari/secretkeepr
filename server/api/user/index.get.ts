import db from "~~/server/lib/db"
import { getUserFromSession } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      memberships: {
        include: {
          organization: {
            include: {
              memberships: {
                include: { user: true },
              },
            },
          },
        },
      },
      projectMemberships: {
        include: {
          project: {
            include: {
              members: {
                select: {
                  role: true,
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      cliTokens: {
        select: {
          token: true,
          expiresAt: true,
          createdAt: true,
        },
      },
    },
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" })
  }

  return user
})
