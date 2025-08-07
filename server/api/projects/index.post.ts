import db from "#server/lib/db"
import { createAuditLog, generateprojectSlug, getUserFromSession, requireOrgRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)
  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project name is required" })
  }
  if (!body.orgId || typeof body.orgId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "organization ID is required" })
  }

  await requireOrgRole(sessionUser.id!, body.orgId, ["owner"])

  const projectSlug = await generateprojectSlug(body.orgId, body.slug || body.name)
  const existingProject = await db.project.findFirst({
    where: {
      orgId: body.orgId,
      OR: [
        { slug: projectSlug },
        { name: body.name },
      ],
    },
  })
  if (existingProject) {
    throw createError({ statusCode: 409, statusMessage: "Duplicate project name or slug. Please choose a different value." })
  }

  const newProject = await db.project.create({
    data: {
      name: body.name,
      slug: projectSlug,
      description: body.description || "",
      orgId: body.orgId,
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
    orgId: body.orgId,
    action: "project.create",
    resource: `Project: ${newProject.id}`,
    metadata: {
      name: newProject.name,
      slug: newProject.slug,
      description: newProject.description,
    },
    req: event.node.req,
  })

  return { message: "Project created successfully", newProject }
})
