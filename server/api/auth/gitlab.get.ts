import type { H3Event } from "h3"
import { handleOAuthUser } from "~~/server/lib/auth"

export default defineOAuthGitLabEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event: any, { user, tokens }: any) {
    if (!user || typeof user !== "object") {
      throw createError({ statusCode: 400, statusMessage: "Invalid user data received from GitLab" })
    }

    const gitlabId = user.id?.toString()
    const email = user.email
    const name = user.name || user.username
    const picture = user.avatar_url

    console.log("Received tokens from GitLab:", JSON.stringify(tokens, null, 2))
    console.log("Extracted user data from GitLab:", { gitlabId, email, name, picture })

    if (!gitlabId || !email) {
      throw createError({ statusCode: 400, statusMessage: "Missing required user data from GitLab" })
    }

    return handleOAuthUser(event, {
      id: gitlabId,
      name,
      email,
      image: picture,
      provider: "gitlab",
    })
  },
  async onError(event: H3Event, error: any) {
    console.error("GitLab OAuth error:", error)
    if (!event || !event.node?.res) {
      throw createError({ statusCode: 500, statusMessage: "Internal server error" })
    }

    return sendRedirect(event, "/sign-in?error=gitlab_oauth_failed")
  },
})
