type Environment = "development" | "staging" | "production"

type Role = "owner" | "admin" | "member"

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  activeOrgId?: string | null
  apiToken?: string | null
  createdAt?: string
  updatedAt?: string
}

interface Organization {
  id: string
  name: string
  role: Role
  createdAt?: string
  updatedAt?: string
  members?: OrganizationMember[]
  projects?: Project[]
}

interface ActiveOrg {
  id: string
  name: string
  role: Role
  projects: { id: string, name: string, slug: string }[]
}

interface Project {
  id: string
  name: string
  slug: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
  orgId: string
  role?: Role
  members?: ProjectMember[]
  secrets?: Secret[]
}

interface ProjectMember {
  userId: string
  projectId: string
  role: Role
  createdAt?: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

interface Secret {
  id: string
  key: string
  description?: string | null
  projectId: string
  createdAt?: string
  updatedAt?: string
  values: SecretValue[]
}

interface SecretValue {
  value: string
  environment: Environment
  secretId: string
  createdAt?: string
  updatedAt?: string
}

interface OrganizationMember {
  userId: string
  orgId: string
  role: Role
  createdAt?: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

interface Invitation {
  id: string
  token: string
  orgId: string
  role: Role
  expiresAt: string
  createdAt?: string
  organization: {
    id: string
    name: string
  }
}

interface AuditLog {
  id: string
  action: string
  resource: string
  metadata: Record<string, any>
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface AuditLogsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface AuditLogsResponse {
  auditLogs: AuditLog[]
  pagination: AuditLogsPagination
}

interface AuditFilters {
  actions: string[]
  resources: string[]
  users: {
    id: string
    name: string
    email: string
  }[]
}

interface UpdateUserInput {
  name?: string
  email?: string
}

interface CreateOrgInput {
  name: string
}

interface UpdateOrgInput {
  name?: string
}

interface InviteMemberInput {
  email: string
  role: Role
}

interface AcceptInviteInput {
  token: string
}

interface UpdateOrgMemberInput {
  role: Role
}

interface CreateProjectInput {
  name: string
  slug?: string
  description?: string
}

interface UpdateProjectInput {
  name?: string
  description?: string
}

interface AddProjectMemberInput {
  email: string
  role: Role
}

interface UpdateProjectMemberInput {
  role: Role
}

interface CreateSecretValueInput {
  environment: Environment
  value: string
}

interface CreateSecretInput {
  key: string
  description?: string
  values: CreateSecretValueInput[]
}

interface UpdateSecretInput {
  description?: string
  values?: CreateSecretValueInput[]
}
