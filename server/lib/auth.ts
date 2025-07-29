import type { H3Event } from "h3"
import { randomBytes } from "node:crypto"
import db from "~~/server/lib/db"

export async function handleOAuthUser(event: H3Event, userData: {
  id: string
  name: string | null
  email: string
  image: string | null
  provider: "google" | "github"
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
          memberships: {
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
        memberships: {
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
          memberships: {
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

  const cliToken = randomBytes(16).toString("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
  await db.cliToken.create({
    data: {
      token: cliToken,
      userId: user.id,
      expiresAt,
    },
  })

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name!,
    image: user.image ?? null,
    memberships: user.memberships!,
    projects: [],
    cliToken,
  }

  await setUserSession(event, {
    user: sessionUser,
    loggedInAt: new Date(),
  })

  return sendRedirect(event, "/admin/projects")
}
