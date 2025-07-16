import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      memberships: {
        select: {
          organizationId: true,
        },
      },
    },
  })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" })
  }

  await db.user.delete({
    where: { id: user.id },
  })

  // Check organizations where user was a member for remaining users
  const organizationsDeleted = []
  for (const membership of user.memberships) {
    const remainingMembersCount = await db.userOrganizationMembership.count({
      where: { organizationId: membership.organizationId },
    })
    if (remainingMembersCount === 0) {
      await db.organization.delete({
        where: { id: membership.organizationId },
      })
      organizationsDeleted.push(membership.organizationId)
    }
  }

  return { message: "User deleted successfully", organizationsDeleted }
})
