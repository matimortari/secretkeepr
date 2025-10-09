import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"
import { addProjectMemberSchema } from "#shared/schemas/project"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  const body = await readBody(event)
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id, projectId, ["owner", "admin"])

  const { email, role } = addProjectMemberSchema.parse(body)

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        select: { id: true, name: true },
      },
    },
  })
  if (!project) {
    throw createError({ statusCode: 404, message: "Project not found" })
  }

  const targetUser = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, name: true, email: true },
  })
  if (!targetUser) {
    throw createError({ statusCode: 404, message: "User not found with the provided email" })
  }

  const existingMembership = await db.projectMembership.findUnique({
    where: {
      userId_projectId: {
        userId: targetUser.id,
        projectId,
      },
    },
  })
  if (existingMembership) {
    throw createError({ statusCode: 409, message: "User is already a member of this project" })
  }

  const orgMembership = await db.organizationMembership.findUnique({
    where: {
      userId_orgId: {
        userId: targetUser.id,
        orgId: project.orgId,
      },
    },
  })
  if (!orgMembership) {
    throw createError({ statusCode: 403, message: "User must be a member of the organization before being added to the project" })
  }

  const membership = await db.projectMembership.create({
    data: {
      userId: targetUser.id,
      projectId,
      role,
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
    userId: sessionUser.id,
    orgId: project.orgId,
    action: "create",
    resource: "project_membership",
    metadata: {
      projectId,
      projectName: project.name,
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name,
      assignedRole: role,
    },
    req: event.node.req,
  })

  return {
    id: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    image: membership.user.image,
    role: membership.role,
    joinedAt: membership.createdAt,
  }
})
