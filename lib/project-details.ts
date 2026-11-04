export type ProjectActionType = 'download' | 'website'

export function normalizeTags(tags: string[] = []): string[] {
  const seen = new Set<string>()
  return tags.map((tag) => tag.trim()).filter((tag) => {
    const key = tag.toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function normalizeWebsiteUrl(value: string = ''): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new Error('Enter a valid website URL starting with https:// or http://.')
  }
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) {
    throw new Error('Enter a valid website URL starting with https:// or http://.')
  }
  return url.href
}

export function projectDetailsForSave(project: {
  tags?: string[]
  action_type?: ProjectActionType
  website_url?: string
  download_url?: string
}) {
  const actionType = project.action_type ?? 'download'
  if (actionType !== 'download' && actionType !== 'website') {
    throw new Error('Choose Download or Website.')
  }
  return {
    tags: normalizeTags(project.tags),
    action_type: actionType,
    download_url: project.download_url?.trim() || null,
    website_url: normalizeWebsiteUrl(project.website_url) || null,
  }
}
