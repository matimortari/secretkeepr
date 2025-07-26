import type { EventHandlerRequest, H3Event } from "h3"
import type { IncomingMessage } from "node:http"
import { getServerSession } from "#auth"
import db from "~~/server/lib/db"

// Find user from session or throw an error if not found
export async function getUserFromSession(event: H3Event<EventHandlerRequest>) {
  const session = await getServerSession(event)
  if (session?.user?.id) {
    return session.user
  }

  // If no session, try CLI token in Authorization header
  const authHeader = event.node.req.headers.authorization
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }

  // Lookup user by CLI token in DB
  const userWithToken = await db.user.findFirst({
    where: {
      cliTokens: {
        some: {
          token,
          expiresAt: {
            gt: new Date(),
          },
        },
      },
    },
  })
  if (!userWithToken) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" })
  }

  // Return user info as a "session user" object
  return {
    id: userWithToken.id,
    name: userWithToken.name,
    email: userWithToken.email,
    image: userWithToken.image,
  }
}

// Check if the user has a specific role in an organization
export async function requireOrgRole(userId: string, orgId: string, roles: string[]) {
  const membership = await db.userOrganizationMembership.findUnique({
    where: { userId_orgId: { userId, orgId } },
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

interface AuditLogType {
  id?: string
  userId: string
  orgId: string
  action: string
  resource: string
  metadata?: Record<string, any>
  createdAt?: Date
  req?: IncomingMessage
}

// Handle audit logging for actions performed by users
export async function createAuditLog({ userId, orgId, action, resource, metadata = {}, req }: AuditLogType) {
  const ip = (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0].trim() || req?.socket?.remoteAddress || null
  const userAgent = req?.headers?.["user-agent"] || null

  await db.auditLog.create({
    data: {
      userId,
      orgId,
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
