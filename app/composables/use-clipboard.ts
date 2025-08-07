export function useClipboard() {
  function createClipboardHandler() {
    const copied = ref(false)
    const copyIcon = computed(() => copied.value ? "ph:check-bold" : "ph:clipboard-bold")

    async function copy(text: string) {
      if (!text)
        return

      try {
        await navigator.clipboard.writeText(text)
        copied.value = true
        setTimeout(() => (copied.value = false), 1500)
      }
      catch (error) {
        console.error("Clipboard copy failed:", error)
      }
    }

    return { copy, copied, copyIcon }
  }

  return { createClipboardHandler }
}
