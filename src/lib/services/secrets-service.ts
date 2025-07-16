export async function getProjectSecretsService(projectId: string): Promise<{ secrets: SecretType[] }> {
  const response = await fetch(`/api/projects/${projectId}/secrets`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to get project secrets: ${response.statusText}`)
  }
  return await response.json()
}

export async function createSecretService(projectId: string, data: SecretType): Promise<SecretType> {
  const response = await fetch(`/api/projects/${projectId}/secrets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to create project secret: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateSecretService(projectId: string, secretId: string, data: Partial<SecretType>): Promise<SecretType> {
  const response = await fetch(`/api/projects/${projectId}/secrets/${secretId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update project service: ${response.statusText}`)
  }
  return await response.json()
}

export async function deleteSecretService(projectId: string, secretId: string): Promise<{ message: string, secretId: string }> {
  const response = await fetch(`/api/projects/${projectId}/secrets/${secretId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete project service: ${response.statusText}`)
  }
  return await response.json()
}
