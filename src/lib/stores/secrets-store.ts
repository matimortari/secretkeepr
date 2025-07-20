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
      this.isLoading = true
      this.error = null
      try {
        const response = await getProjectSecretsService(projectId)
        this.secrets = Array.isArray(response.secrets) ? response.secrets : []
      }
      catch (error: any) {
        console.error("Failed to get project secrets:", error)
        this.error = error?.message || "Failed to get project secrets"
      }
      finally {
        this.isLoading = false
      }
    },

    async createSecret(
      projectId: string,
      secretData: {
        key: string
        description?: string
        values: {
          environment: Environment
          value: string
        }[]
      },
    ) {
      this.isLoading = true
      this.error = null
      try {
        const response = await createSecretService(projectId, secretData)
        const newSecret = response.newSecret ?? response
        this.secrets.push(newSecret)
        return newSecret
      }
      catch (error: any) {
        console.error("Failed to create secret:", error)
        this.error = error?.message || "Failed to create secret"
      }
      finally {
        this.isLoading = false
      }
    },

    async updateSecret(
      projectId: string,
      secretId: string,
      data: Partial<{
        key: string
        description: string
        values: SecretValueType[]
      }>,
    ) {
      this.isLoading = true
      this.error = null
      try {
        const payload: any = { ...data }
        if (payload.key === undefined) {
          throw new Error("Secret key is required for update")
        }
        Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])
        const response = await updateSecretService(projectId, secretId, payload)
        const updatedSecret = response.updatedSecret ?? response
        this.secrets = this.secrets.map(secret =>
          secret.id === secretId ? updatedSecret : secret,
        )
        return updatedSecret
      }
      catch (error: any) {
        console.error("Failed to update secret:", error)
        this.error = error?.message || "Failed to update secret"
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteSecret(projectId: string, secretId: string) {
      this.isLoading = true
      this.error = null
      try {
        await deleteSecretService(projectId, secretId)
        this.secrets = this.secrets.filter(secret => secret.id !== secretId)
      }
      catch (error: any) {
        console.error("Failed to delete secret:", error)
        this.error = error?.message || "Failed to delete secret"
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
