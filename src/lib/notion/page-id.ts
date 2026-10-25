import { idToUuid } from 'notion-utils'

export function normalizePageId(value: string) {
  if (!/^(?:[a-f\d]{32}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i.test(value)) {
    return undefined
  }

  return idToUuid(value.replaceAll('-', '').toLowerCase())
}
