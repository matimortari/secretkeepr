type Environment = "development" | "staging" | "production"
type Role = "owner" | "admin" | "member"

interface UserOrganizationMembershipType {
  id?: string
  userId: string
  organizationId: string
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
  createdAt?: Date
  updatedAt?: Date
  memberships: UserOrganizationMembershipType[]
  projectMemberships?: ProjectMemberType[]
  cliTokens?: { token: string, expiresAt: Date, createdAt: Date }[]
}

interface OrganizationType {
  id: string
  name: string
  createdAt?: Date
  updatedAt?: Date
  memberships?: UserOrganizationMembershipType[]
  projects?: ProjectType[]
}

interface ProjectType {
  id?: string
  name: string
  description?: string | null
  organizationId: string
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
  organizationId: string
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
  organizationId: string
  action?: string
  beforeDate?: string
  createdBySelfOnly?: boolean
  protectedActions?: string[]
}

interface UpdateUserPayload {
  name?: string
  image?: string | null
}

interface CreateProjectPayload {
  name: string
  description?: string
  organizationId: string
}

interface UpdateProjectPayload {
  id: string
  name?: string
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

interface CreateOrganizationPayload {
  name: string
}

interface UpdateOrganizationPayload {
  id: string
  name?: string
}
