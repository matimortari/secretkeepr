import type { H3Event } from "h3"
import { randomBytes } from "node:crypto"
import db from "#server/lib/db"

export async function handleOAuthUser(event: H3Event, userData: {
  id: string
  name: string | null
  email: string
  image: string | null
  cliToken?: string
  provider: "google" | "github" | "gitlab"
}) {
  const { id: providerAccountId, name, email, image, provider } = userData

  // Try to find account linked to OAuth provider ID
  const existingAccount = await db.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    include: {
      user: {
        include: {
          organizations: {
            select: {
              role: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })

  // If no user found by account, try to find existing user by email. Create user if none found
  let user = existingAccount?.user ?? undefined
  if (!user) {
    const foundUser = await db.user.findUnique({
      where: { email },
      include: {
        organizations: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    })

    user = foundUser ?? undefined
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name,
          image: image ?? undefined,
        },
        include: {
          organizations: {
            select: {
              role: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })
    }
  }
  if (!existingAccount) {
    await db.account.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId,
      },
    })
  }

  // Always regenerate the CLI token on login
  const cliToken = randomBytes(16).toString("hex")
  await db.user.update({
    where: { id: user.id },
    data: {
      cliToken,
    },
  })

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name!,
    image: user.image ?? null,
    organizations: user.organizations,
    projects: [],
    cliToken,
  }

  await setUserSession(event, {
    user: sessionUser,
    loggedInAt: new Date(),
  })

  return sendRedirect(event, "/admin/projects")
}
