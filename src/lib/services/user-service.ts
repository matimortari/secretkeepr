export async function getUserService(): Promise<UserType> {
  const response = await fetch("/api/user", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.statusText}`)
  }

  return await response.json()
}

export async function deleteUserService(): Promise<{ message: string }> {
  const response = await fetch("/api/user", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateUserService(data: Partial<UserType>): Promise<{ message: string, user: UserType }> {
  const response = await fetch("/api/user", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`)
  }

  return await response.json()
}
