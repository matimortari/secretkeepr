export function useEnvFile(projectId: string) {
  const projectsStore = useProjectStore()

  const project = computed(() => projectsStore.projects.find(p => p.id === projectId))

  const handleImportFromEnv = async (importedSecrets: Secret[]) => {
    if (!importedSecrets || importedSecrets.length === 0) {
      console.warn("No secrets to import")
      return
    }

    try {
      const results = await Promise.allSettled(importedSecrets.map(async (secret) => {
        if (!secret.key) {
          throw new Error("Secret key is required")
        }

        const existing = projectsStore.secrets.find((s: any) => s.key === secret.key && s.projectId === projectId)
        if (existing) {
          const existingValues = existing.values ?? []
          const newValues = secret.values ?? []
          
          const mergedValues = [...existingValues]
          newValues.forEach((newValue: any) => {
            const existingIndex = mergedValues.findIndex((v: any) => v.environment === newValue.environment)
            if (existingIndex >= 0) {
              mergedValues[existingIndex] = newValue
            } else {
              mergedValues.push(newValue)
            }
          })

          return projectsStore.updateProjectSecret(projectId, existing.id!, {
            description: secret.description ?? undefined,
            values: mergedValues,
          })
        }
        else {
          return projectsStore.createProjectSecret(projectId, {
            key: secret.key,
            description: secret.description ?? "",
            values: secret.values ?? [],
          })
        }
      }))

      const failures = results.filter(result => result.status === 'rejected')
      if (failures.length > 0) {
        console.error(`Failed to import ${failures.length} secrets:`, failures)
      }

      const successes = results.filter(result => result.status === 'fulfilled')
      console.log(`Successfully imported ${successes.length} secrets`)

      await projectsStore.getProjectSecrets(projectId)
    }
    catch (error: any) {
      console.error("Failed to import secrets:", error)
      throw error
    }
  }

  const handleExportToEnv = async (env: string | null | undefined) => {
    try {
      if (!env) {
        console.error("Environment is required for export")
        return
      }

      const filteredSecrets = projectsStore.secrets
        .filter((s: any) => s.projectId === projectId)
        .map((s: any) => {
          const value = s.values?.find((v: any) => v.environment === env)?.value
          return value ? `${s.key}="${value}"` : null
        })
        .filter(Boolean)
        .join("\n")

      if (!filteredSecrets) {
        console.warn(`No secrets found for environment: ${env}`)
        return
      }

      const blob = new Blob([filteredSecrets], { type: "text/plain" })
      const projectName = project.value?.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w.-]/g, "") || "project"
      const fileName = `.env.${projectName}.${env}`
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
