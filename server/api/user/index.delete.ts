import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true },
  })
  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" })
  }

  // Check for ownership responsibilities and prevent deletion if user is the sole owner of any organization
  const ownedOrgs = await db.organizationMembership.findMany({
    where: {
      userId: user.id,
      role: "owner",
    },
    include: {
      organization: {
        include: {
          memberships: true,
        },
      },
    },
  })

  for (const membership of ownedOrgs) {
    const otherOwners = membership.organization.memberships.filter(m => m.role === "owner" && m.userId !== user.id)
    if (otherOwners.length === 0) {
      throw createError({ statusCode: 409, message: `Cannot delete account. You are the sole owner of organization "${membership.organization.name}". Please transfer ownership or delete the organization first.` })
    }
  }

  await db.user.delete({
    where: { id: user.id },
  })

  await clearUserSession(event)

  return { success: true, message: "User account deleted successfully" }
})
