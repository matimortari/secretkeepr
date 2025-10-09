declare module "#auth-utils" {
  interface User {
    id: string
    email: string
    name: string
    image?: string | null
    apiToken?: string
    organizations: {
      role: Role
      organization: {
        id: string
        name: string
      }
    }[]
    projects?: {
      id: string
      slug: string
      name: string
      role: Role
    }[]
  }

  interface UserSession {
    user: User
    loggedInAt: Date
  }
}
