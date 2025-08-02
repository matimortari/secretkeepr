declare module "#auth-utils" {
  interface User {
    id: string
    email: string
    name: string
    image?: string | null
    memberships: {
      role: Role
      organization: {
        id: string
        name: string
      }
    }[]
    projects?: {
      id: string
      name: string
      role: Role
    }[]
    cliToken?: string
  }

  interface UserSession {
    user: User
    loggedInAt: Date
  }
}
