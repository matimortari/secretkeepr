import type { DefaultSession } from "next-auth"
import { randomBytes } from "node:crypto"
import { NuxtAuthHandler } from "#auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import db from "~~/server/lib/db"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string
      image: string
      email: string
      memberships: {
        role: Role
        organization: {
          id: string
          name: string
          createdAt: Date
          updatedAt: Date
        }
      }[]
      projects?: { id: string, name: string, role: Role }[]
      cliToken?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    cliToken?: string
  }
}

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    GithubProvider.default({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // @ts-expect-error Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const providerAccountId = account.providerAccountId
        const provider = account.provider
        const email = profile.email as string

        const getProfilePicture = (profile: any, provider: string) => {
          if (provider === "google")
            return profile.picture ?? ""
          if (provider === "github")
            return profile.avatar_url ?? ""
          return ""
        }

        const existingAccount = await db.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
          include: { user: true },
        })

        let user = existingAccount?.user
        if (!user) {
          user = await db.user.create({
            data: {
              email,
              name: profile.name,
              image: getProfilePicture(profile, provider),
              accounts: {
                create: {
                  provider,
                  providerAccountId,
                },
              },
            },
          })
        }
        else {
          const linkedAccount = await db.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider,
                providerAccountId,
              },
            },
          })
          if (!linkedAccount) {
            await db.account.create({
              data: {
                userId: user.id,
                provider,
                providerAccountId,
              },
            })
          }
        }

        // Generate new CLI token on login
        const newCliToken = randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h expiry

        await db.cliToken.create({
          data: {
            token: newCliToken,
            userId: user.id,
            expiresAt,
          },
        })

        token.userId = user.id
        token.cliToken = newCliToken
      }

      return token
    },

    async session({ session, token }) {
      if (!token.userId)
        return session

      const user = await db.user.findUnique({
        where: { id: token.userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
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
      if (!user)
        return session

      const memberships = await db.projectMember.findMany({
        where: { userId: user.id },
        select: {
          role: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return {
        ...session,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          memberships: user.memberships,
          projects: memberships.map(m => ({
            id: m.project.id,
            name: m.project.name,
            role: m.role,
          })),
          cliToken: token.cliToken,
        },
      }
    },
  },
})
