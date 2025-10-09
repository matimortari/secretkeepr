import type { EventHandlerRequest, H3Event } from "h3"
import db from "#server/lib/db"

export async function getUserFromSession(event: H3Event<EventHandlerRequest>) {
  const session = await getUserSession(event)
  if (session?.user?.id) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { activeOrgId: true },
    })
    return { ...session.user, activeOrgId: dbUser?.activeOrgId ?? null }
  }

  // Fallback: check for API token
  const authHeader = event.node.req.headers.authorization
  const token = authHeader?.split(" ")[1]
  if (!token) {
    throw createError({ statusCode: 401, message: "Unauthorized" })
  }

  const userWithToken = await db.user.findUnique({ where: { apiToken: token } })
  if (!userWithToken) {
    throw createError({ statusCode: 401, message: "Invalid token" })
  }

  return userWithToken
}

export async function requireOrgRole(userId: string, orgId: string, roles: string[]) {
  const membership = await db.organizationMembership.findUnique({
    where: { userId_orgId: { userId, orgId } },
    select: { role: true },
  })
  if (!membership) {
    throw createError({ statusCode: 403, message: "Access denied: not an organization member" })
  }
  if (!roles.includes(membership.role)) {
    throw createError({ statusCode: 403, message: "Access denied: insufficient permissions" })
  }

  return membership
}

export async function requireProjectRole(userId: string, projectId: string, roles: string[]) {
  const membership = await db.projectMembership.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: { role: true },
  })

  if (!membership) {
    throw createError({ statusCode: 403, message: "Access denied: not a project member" })
  }
  if (!roles.includes(membership.role)) {
    throw createError({ statusCode: 403, message: "Access denied: insufficient permissions" })
  }

  return membership
}

export async function createAuditLog({ userId, orgId, action, resource, metadata = {}, req }: any) {
  const ip = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || null
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

export function sanitizeMetadata(metadata: any) {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const { ip, userAgent, ...safeMetadata } = metadata as Record<string, unknown>
    return safeMetadata
  }
  return metadata
}

export function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getInviteBaseUrl(event: any) {
  const protocol = event.req.headers["x-forwarded-proto"] || "http"
  const host = event.req.headers.host
  return `${protocol}://${host}`
}
