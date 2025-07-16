import type { EventHandlerRequest, H3Event } from "h3"
import { getServerSession } from "#auth"

// Find user from session or throw an error if not found
export async function getUserFromSession(event: H3Event<EventHandlerRequest>) {
  const session = await getServerSession(event)
  if (!session?.user.id)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })

  return session.user
}

// Format a date string to a more readable format
export function formatDate(dateString: Date) {
  const formattedDate = new Date(dateString).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    day: "numeric",
  })

  return formattedDate.charAt(0).toLowerCase() + formattedDate.slice(1)
}
