import db from "~~/server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  const body = await readBody(event)
  if (!body.userId || typeof body.userId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" })
  }
  if (!body.role || !["admin", "member"].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: "Valid role is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { orgId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  const orgMembership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_orgId: {
        userId: body.userId,
        orgId: project.orgId,
      },
    },
  })
  if (!orgMembership) {
    throw createError({ statusCode: 400, statusMessage: "User is not a member of the organization this project belongs to" })
  }

  const existing = await db.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: body.userId,
        projectId,
      },
    },
  })
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: "User is already a member of the project" })
  }

  const newUser = await db.projectMember.create({
    data: {
      userId: body.userId,
      role: body.role,
      projectId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    orgId: project.orgId,
    action: "project.member.add",
    resource: `Project: ${projectId}`,
    metadata: {
      id: newUser.userId,
      role: newUser.role,
    },
    req: event.node.req,
  })

  return { message: "User added to project", newUser }
})
