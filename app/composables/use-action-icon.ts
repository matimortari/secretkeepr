export function useActionIcon() {
  function createActionHandler(defaultIcon: string) {
    const success = ref(false)

    const icon = computed(() =>
      success.value ? "ph:check-bold" : defaultIcon,
    )

    function triggerSuccess() {
      success.value = true
      setTimeout(() => (success.value = false), 1500)
    }

    async function triggerCopy(text: string) {
      if (!text)
        return

      try {
        await navigator.clipboard.writeText(text)
        triggerSuccess()
      }
      catch (error: any) {
        console.error("Failed to copy content:", error)
      }
    }

    return { icon, triggerSuccess, triggerCopy }
  }

  return { createActionHandler }
}
