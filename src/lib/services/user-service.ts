export async function getUserService(): Promise<UserType> {
  const response = await fetch("/api/user", {
    method: "GET",
  })
  if (!response.ok) {
    throw new Error(`Failed to get user data: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateUserService(data: UpdateUserPayload): Promise<{ message: string, user: UserType }> {
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

export async function updateUserImageService(formData: FormData): Promise<{ imageUrl: string }> {
  const response = await fetch("/api/user/image-upload", {
    method: "POST",
    body: formData,
  })
  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`)
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
