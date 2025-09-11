import db from "#server/lib/db"
import { createAuditLog, generateProjectSlug, getUserFromSession, requireOrgRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)

  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project name is required" })
  }
  if (!body.orgId || typeof body.orgId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const name = body.name.trim()
  if (name.length === 0 || name.length > 50) {
    throw createError({ statusCode: 400, statusMessage: "Project name must be 1-50 characters" })
  }

  const description = body.description?.trim() || ""
  if (description.length > 255) {
    throw createError({ statusCode: 400, statusMessage: "Project description must be 255 characters or less" })
  }

  const slug = (body.slug?.trim() || name).toLowerCase().replace(/[^a-z0-9\-]/g, "-")

  await requireOrgRole(sessionUser.id!, body.orgId, ["owner"])

  const projectSlug = await generateProjectSlug(body.orgId, slug)
  const existingProject = await db.project.findFirst({
    where: {
      orgId: body.orgId,
      OR: [{ slug: projectSlug }, { name }],
    },
  })
  if (existingProject) {
    throw createError({ statusCode: 409, statusMessage: "Duplicate project name or slug. Please choose a different value." })
  }

  const newProject = await db.project.create({
    data: {
      name,
      slug: projectSlug,
      description,
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
