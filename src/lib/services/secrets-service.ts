import { getBaseUrl } from "~/lib/utils"

export async function getProjectSecretsService(projectId: string): Promise<{ secrets: SecretType[] }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/secrets`, {
    method: "GET",
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function createSecretService(projectId: string, data: CreateSecretPayload): Promise<{ message: string, newSecret: SecretType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/secrets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function updateSecretService(projectId: string, secretId: string, data: UpdateSecretPayload): Promise<{ message: string, updatedSecret: SecretType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/secrets/${secretId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function deleteSecretService(projectId: string, secretId: string): Promise<{ message: string, secretId: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/secrets/${secretId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}
