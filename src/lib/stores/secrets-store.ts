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
    async getSecretsByProject(projectId: string) {
      if (!projectId) {
        this.error = "Project ID is required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await getProjectSecretsService(projectId)
        this.secrets = response.secrets
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createSecret(projectId: string, payload: CreateSecretPayload) {
      if (!projectId || !payload.key || !Array.isArray(payload.values)) {
        this.error = "Project ID, Secret key, and values are required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await createSecretService(projectId, payload)
        this.secrets.push(response.newSecret)
        return response
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateSecret(projectId: string, secretId: string, payload: UpdateSecretPayload) {
      if (!projectId || !secretId) {
        this.error = "Project ID and Secret ID are required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const cleanedPayload = { ...payload }
        Object.keys(cleanedPayload).forEach((k) => {
          const typedKey = k as keyof typeof cleanedPayload
          if (cleanedPayload[typedKey] === undefined) {
            delete cleanedPayload[typedKey]
          }
        })

        const response = await updateSecretService(projectId, secretId, cleanedPayload)
        this.secrets = this.secrets.map(secret => secret.id === secretId ? response.updatedSecret : secret)
        return response
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteSecret(projectId: string, secretId: string) {
      if (!projectId || !secretId) {
        this.error = "Project ID and Secret ID are required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await deleteSecretService(projectId, secretId)
        this.secrets = this.secrets.filter(secret => secret.id !== secretId)
        return response
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
