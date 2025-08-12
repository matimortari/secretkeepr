import {
  createSecretService,
  deleteSecretService,
  getProjectSecretsService,
  updateSecretService,
} from "~/lib/services/secrets-service"

export const useSecretsStore = defineStore("secrets", () => {
  const secrets = ref<SecretType[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function requireProjectId(projectId: string) {
    if (!projectId) {
      error.value = "Project ID is required"
      throw new Error(error.value)
    }
  }

  function requireSecretId(secretId: string) {
    if (!secretId) {
      error.value = "Secret ID is required"
      throw new Error(error.value)
    }
  }

  function requireCreateSecretPayload(payload: CreateSecretPayload) {
    if (!payload.key || !Array.isArray(payload.values)) {
      error.value = "Secret key and values are required"
      throw new Error(error.value)
    }
  }

  async function getSecretsByProject(projectId: string) {
    requireProjectId(projectId)
    isLoading.value = true
    error.value = null

    try {
      const response = await getProjectSecretsService(projectId)
      secrets.value = response.secrets
      return secrets.value
    }
    catch (error: any) {
      error.value = error.message || "Failed to load secrets"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function createSecret(projectId: string, payload: CreateSecretPayload) {
    requireProjectId(projectId)
    requireCreateSecretPayload(payload)
    isLoading.value = true
    error.value = null

    try {
      const response = await createSecretService(projectId, payload)
      secrets.value.push(response.newSecret)
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to create secret"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateSecret(projectId: string, secretId: string, payload: UpdateSecretPayload) {
    requireProjectId(projectId)
    requireSecretId(secretId)
    isLoading.value = true
    error.value = null

    try {
      const cleanedPayload = { ...payload }
      Object.keys(cleanedPayload).forEach((key) => {
        const typedKey = key as keyof typeof cleanedPayload
        if (cleanedPayload[typedKey] === undefined) {
          delete cleanedPayload[typedKey]
        }
      })

      const response = await updateSecretService(projectId, secretId, cleanedPayload)
      secrets.value = secrets.value.map(secret =>
        secret.id === secretId ? response.updatedSecret : secret,
      )
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to update secret"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function deleteSecret(projectId: string, secretId: string) {
    requireProjectId(projectId)
    requireSecretId(secretId)
    isLoading.value = true
    error.value = null

    try {
      const response = await deleteSecretService(projectId, secretId)
      secrets.value = secrets.value.filter(secret => secret.id !== secretId)
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to delete secret"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    secrets,
    isLoading,
    error,
    getSecretsByProject,
    createSecret,
    updateSecret,
    deleteSecret,
  }
})
