export function useEnvFile(projectId: string) {
  const projectsStore = useProjectsStore()
  const secretsStore = useSecretsStore()

  const project = computed(() => projectsStore.projects.find(p => p.id === projectId))

  const handleImportFromEnv = async (importedSecrets: SecretType[]) => {
    try {
      await Promise.all(importedSecrets.map(async (secret) => {
        const existing = secretsStore.secrets.find(s => s.key === secret.key && s.projectId === projectId)
        if (existing) {
          const updatedValues = [...(existing.values ?? []), ...(secret.values ?? [])]
          return secretsStore.updateSecret(projectId, existing.id!, {
            key: existing.key,
            values: updatedValues,
          })
        }
        else {
          return secretsStore.createSecret(projectId, {
            key: secret.key,
            values: secret.values ?? [],
          })
        }
      }))
      await secretsStore.getSecretsByProject(projectId)
    }
    catch (error: any) {
      console.error("Failed to import secrets:", error)
    }
  }

  const handleExportToEnv = async (env: string | null | undefined) => {
    try {
      const filteredSecrets = secretsStore.secrets
        .filter(s => s.projectId === projectId)
        .map((s) => {
          const value = s.values?.find(v => v.environment === env)?.value
          return value ? `${s.key}="${value}"` : null
        })
        .filter(Boolean)
        .join("\n")

      const blob = new Blob([filteredSecrets], { type: "text/plain" })
      const fileName = `.env.${project.value?.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w.-]/g, "")}.${env}`
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: fileName,
      })
      a.click()

      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    catch (error: any) {
      console.error("Failed to export secrets:", error)
    }
  }

  return { handleImportFromEnv, handleExportToEnv }
}
