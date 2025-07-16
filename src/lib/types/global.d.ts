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
  id: string
  userId: string
  action: string
  resource: string
  metadata?: any
  createdAt: Date
}

interface AuditLogsResponseType {
  logs: AuditLogType[]
  page: number
  limit: number
  total: number
}
