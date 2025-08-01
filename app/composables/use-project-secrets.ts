import { useProjectsStore } from "~/lib/stores/projects-store"
import { useSecretsStore } from "~/lib/stores/secrets-store"

export function useProjectSecrets(projectId: string) {
  const projectsStore = useProjectsStore()
  const secretsStore = useSecretsStore()

  const project = computed(() => projectsStore.projects.find(p => p.id === projectId))
  const secrets = computed(() =>
    secretsStore.secrets.filter(secret => secret.projectId === projectId),
  )

  return { project, secrets }
}
