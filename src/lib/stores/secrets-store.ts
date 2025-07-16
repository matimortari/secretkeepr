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
  }),

  actions: {
    async getSecretsByProject(projectId: string) {
      this.isLoading = true
      try {
        const response = await getProjectSecretsService(projectId)
        this.secrets = Array.isArray(response.secrets) ? response.secrets : []
      }
      catch (error) {
        console.error("Failed to get project secrets:", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async createSecret(projectId: string, secretData: {
      key: string
      description?: string
      values: {
        environment: Environment
        value: string
      }[]
    }) {
      this.isLoading = true
      try {
        const newSecret = await createSecretService(projectId, secretData as SecretType)
        this.secrets.push(newSecret)
      }
      catch (error) {
        console.error("Failed to create secret:", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async updateSecret(projectId: string, secretId: string, data: Partial<{
      key: string
      description: string
      values: SecretValueType[]
    }>) {
      this.isLoading = true
      try {
        const updated = await updateSecretService(projectId, secretId, data)
        this.secrets = this.secrets.map(secret =>
          secret.id === secretId ? updated : secret,
        )
      }
      catch (error) {
        console.error("Failed to update secret:", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteSecret(projectId: string, secretId: string) {
      this.isLoading = true
      try {
        await deleteSecretService(projectId, secretId)
        this.secrets = this.secrets.filter(secret => secret.id !== secretId)
      }
      catch (error) {
        console.error("Failed to delete secret:", error)
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
