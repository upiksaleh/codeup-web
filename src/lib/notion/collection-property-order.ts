import type { ExtendedRecordMap } from 'notion-types'
import { getBlockValue } from 'notion-utils'

export function withCollectionPropertyOrder(recordMap: ExtendedRecordMap): ExtendedRecordMap {
  const collection = { ...recordMap.collection }

  for (const [id, entry] of Object.entries(collection)) {
    const value = getBlockValue(entry)
    const properties = value?.format?.collection_page_properties
    if (!value || !properties) continue

    const configured = new Set(properties.map(({ property }) => property))
    const missing = Object.keys(value.schema).filter(
      (property) => property !== 'title' && !configured.has(property),
    )
    if (!missing.length) continue

    // Missing indexes sort as NaN, which orders rows differently on server and browser.
    collection[id] = {
      ...entry,
      value: {
        ...value,
        format: {
          ...value.format,
          collection_page_properties: [
            ...properties,
            ...missing.map((property) => ({ property, visible: true })),
          ],
        },
      },
    }
  }

  return { ...recordMap, collection }
}
