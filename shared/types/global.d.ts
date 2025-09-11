type Environment = "development" | "staging" | "production"
type Role = "owner" | "admin" | "member"

interface UserOrgMembershipType {
  id?: string
  userId: string
  orgId: string
  role: Role
  createdAt?: Date
  user?: UserType
  organization?: OrganizationType
}

interface ProjectMemberType {
  id?: string
  userId: string
  projectId: string
  role: Role
  createdAt?: Date
  user?: UserType
  project?: ProjectType
}

interface UserType {
  id: string
  name: string
  email: string
  image: string | null
  cliToken?: string | null
  createdAt?: Date
  updatedAt?: Date
  organizations: UserOrgMembershipType[]
  projects?: ProjectMemberType[]
}

interface OrganizationType {
  id: string
  name: string
  createdAt?: Date
  updatedAt?: Date
  organizations?: UserOrgMembershipType[]
  projects?: ProjectType[]
  auditLogs?: AuditLogType[]
}

interface ProjectType {
  id?: string
  name: string
  slug: string
  description?: string | null
  orgId: string
  createdAt?: Date
  updatedAt?: Date
  organization?: OrganizationType
  members?: ProjectMemberType[]
  secrets?: SecretType[]
}

interface SecretType {
  id?: string
  key: string
  description?: string | null
  projectId?: string
  createdAt?: Date
  updatedAt?: Date
  project?: ProjectType
  values?: SecretValueType[]
}

interface SecretValueType {
  id?: string
  environment: Environment
  value: string
  secretId?: string
  createdAt?: Date
  updatedAt?: Date
}

interface AuditLogType {
  id?: string
  userId: string
  orgId: string
  action: string
  resource: string
  metadata?: Record<string, any>
  createdAt?: Date
  req?: IncomingMessage
}

interface AuditLogsResponse {
  logs: AuditLogType[]
  page: number
  limit: number
  total: number
}

interface DeleteAuditLogsPayload {
  orgId: string
  action?: string
  beforeDate?: string
  createdBySelfOnly?: boolean
  protectedActions?: string[]
}

interface UpdateUserPayload {
  name?: string
}

interface CreateProjectPayload {
  name: string
  slug: string
  description?: string
  orgId: string
}

interface UpdateProjectPayload {
  name?: string
  slug?: string
  description?: string | null
}

interface CreateSecretPayload {
  key: string
  description?: string | null
  values: { environment: Environment, value: string }[]
}

interface UpdateSecretPayload {
  key?: string
  description?: string | null
  values?: { environment: Environment, value: string }[]
}

interface AddProjectMemberPayload {
  userId?: string
  role: Role
}

interface CreateOrgPayload {
  name: string
}

interface UpdateOrgPayload {
  id: string
  name?: string
}
