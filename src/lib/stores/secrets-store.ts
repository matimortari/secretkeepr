import {
  createSecretService,
  deleteSecretService,
  getProjectSecretsService,
  updateSecretService,
} from "~/lib/services/secrets-service"

export const useSecretsStore = defineStore("secrets", {
  state: () => ({
    secrets: [] as SecretType[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    requireProjectId(projectId: string) {
      if (!projectId) {
        const error = "Project ID is required"
        this.error = error
        throw new Error(error)
      }
    },

    requireSecretId(secretId: string) {
      if (!secretId) {
        const error = "Secret ID is required"
        this.error = error
        throw new Error(error)
      }
    },

    requireCreateSecretPayload(payload: CreateSecretPayload) {
      if (!payload.key || !Array.isArray(payload.values)) {
        const error = "Secret key and values are required"
        this.error = error
        throw new Error(error)
      }
    },

    async getSecretsByProject(projectId: string) {
      this.requireProjectId(projectId)
      this.isLoading = true
      this.error = null

      try {
        const response = await getProjectSecretsService(projectId)
        this.secrets = response.secrets
        return this.secrets
      }
      catch (error: any) {
        this.error = error?.message || "Failed to load secrets"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createSecret(projectId: string, payload: CreateSecretPayload) {
      this.requireProjectId(projectId)
      this.requireCreateSecretPayload(payload)
      this.isLoading = true
      this.error = null

      try {
        const response = await createSecretService(projectId, payload)
        this.secrets.push(response.newSecret)
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to create secret"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateSecret(projectId: string, secretId: string, payload: UpdateSecretPayload) {
      this.requireProjectId(projectId)
      this.requireSecretId(secretId)
      this.isLoading = true
      this.error = null

      try {
        const cleanedPayload = { ...payload }
        Object.keys(cleanedPayload).forEach((key) => {
          const typedKey = key as keyof typeof cleanedPayload
          if (cleanedPayload[typedKey] === undefined) {
            delete cleanedPayload[typedKey]
          }
        })

        const response = await updateSecretService(projectId, secretId, cleanedPayload)
        this.secrets = this.secrets.map(secret =>
          secret.id === secretId ? response.updatedSecret : secret,
        )
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to update secret"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteSecret(projectId: string, secretId: string) {
      this.requireProjectId(projectId)
      this.requireSecretId(secretId)
      this.isLoading = true
      this.error = null

      try {
        const response = await deleteSecretService(projectId, secretId)
        this.secrets = this.secrets.filter(secret => secret.id !== secretId)
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to delete secret"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
