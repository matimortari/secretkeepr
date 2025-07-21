import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)
  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project name is required" })
  }
  if (!body.organizationId || typeof body.organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "organization ID is required" })
  }

  await requireOrgRole(sessionUser.id!, body.organizationId, ["owner"])

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

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId: body.organizationId,
    action: "project.create",
    resource: `Project: ${newProject.id}`,
    metadata: {
      name: newProject.name,
      description: newProject.description,
    },
    req: event.node.req,
  })

  return { message: "Project created successfully", newProject }
})
