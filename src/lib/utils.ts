// Format a date string to a more readable format
export function formatDate(dateString: Date | undefined | null): string {
  if (!dateString)
    return "-"

  const formattedDate = new Date(dateString).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    day: "numeric",
  })

  return formattedDate.charAt(0).toLowerCase() + formattedDate.slice(1)
}

// Copy a string to the clipboard
export function copyToClipboard(val: string) {
  if (val)
    navigator.clipboard.writeText(val)
}
