import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)
  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project name is required" })
  }
  if (!body.organizationId || typeof body.organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "organization ID is required" })
  }

  const membership = await db.userOrganizationMembership.findFirst({
    where: {
      userId: sessionUser.id,
      organizationId: body.organizationId,
      role: { in: ["owner", "admin"] },
    },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }

  const newProject = await db.project.create({
    data: {
      name: body.name,
      description: body.description || "",
      organizationId: body.organizationId,
      members: {
        create: {
          userId: sessionUser.id!,
          role: "owner",
        },
      },
    },
  })

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "project.create",
      resource: `Project:${newProject.id}`,
      metadata: {
        projectName: newProject.name,
        description: newProject.description,
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "Project created successfully", newProject }
})
