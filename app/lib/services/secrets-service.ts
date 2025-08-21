export async function getProjectSecretsService(projectId: string): Promise<{ secrets: SecretType[] }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/secrets`, {
    method: "GET",
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function createSecretService(projectId: string, payload: CreateSecretPayload): Promise<{ message: string, newSecret: SecretType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/secrets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function updateSecretService(projectId: string, secretId: string, payload: UpdateSecretPayload): Promise<{ message: string, updatedSecret: SecretType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/secrets/${secretId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
