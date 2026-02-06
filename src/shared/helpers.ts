export function detectIsJsxResource(resource: string): boolean {
  return resource.endsWith('.tsx') || resource.endsWith('.jsx')
}

/** PascalCase component name: <Button />、<Card.Title /> take the first segment */
const JSX_TAG_RE = /<([A-Z][a-zA-Z0-9]*)[\s>/]/g

/**
 * from JSX/TSX source code to extract the component name used as a tag (PascalCase),
 * for unimport's regex detection (otherwise nested tags may be stripped and missed)
 */
export function getJsxComponentTagNames(source: string): string[] {
  const names = new Set<string>()
  for (const m of source.matchAll(JSX_TAG_RE))
    names.add(m[1])
  return [...names]
}
