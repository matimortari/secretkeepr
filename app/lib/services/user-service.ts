export async function getUserService(): Promise<UserType> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/user`, {
    method: "GET",
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function updateUserService(payload: UpdateUserPayload): Promise<{ message: string, user: UserType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/user`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function updateUserImageService(image: FormData): Promise<{ imageUrl: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/user/image-upload`, {
    method: "POST",
    body: image,
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function deleteUserService(): Promise<{ message: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/user`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}
