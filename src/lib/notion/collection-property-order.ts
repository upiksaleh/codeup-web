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

    // Upstream subtracts property indexes when sorting. Missing indexes produce NaN,
    // which can order rows differently in the server and browser engines.
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
