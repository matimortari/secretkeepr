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
      catch (err: any) {
        console.error("Failed to copy content:", err)
      }
    }

    return { icon, triggerSuccess, triggerCopy }
  }

  return { createActionHandler }
}
