import type { EventHandlerRequest, H3Event } from "h3"
import { getServerSession } from "#auth"
import db from "~/lib/db"

// Find user from session or throw an error if not found
export async function getUserFromSession(event: H3Event<EventHandlerRequest>) {
  const session = await getServerSession(event)
  if (!session?.user.id)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })

  return session.user
}

// Check if the user has a specific role in an organization
export async function requireOrgRole(userId: string, orgId: string, roles: string[]) {
  const membership = await db.userOrganizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
    select: { role: true },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }
  if (!roles.includes(membership.role)) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  return membership
}

// Check if the user has a specific role in a project
export async function requireProjectRole(userId: string, projectId: string, roles: string[]) {
  const membership = await db.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: { role: true },
  })

  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not a project member" })
  }
  if (!roles.includes(membership.role)) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  return membership
}

// Handle audit logging for actions performed by users
export async function createAuditLog({ userId, action, resource, metadata = {}, req }: AuditLogType) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || null
  const userAgent = req.headers["user-agent"] || null

  await db.auditLog.create({
    data: {
      userId,
      action,
      resource,
      metadata: {
        ...metadata,
        ip,
        userAgent,
      },
    },
  })
}

// Format a date string to a more readable format
export function formatDate(dateString: Date) {
  const formattedDate = new Date(dateString).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    day: "numeric",
  })

  return formattedDate.charAt(0).toLowerCase() + formattedDate.slice(1)
}
