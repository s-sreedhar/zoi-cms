import type { FieldHook } from 'payload'

const format = (val: string): string =>
    val
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
        .toLowerCase()

const formatSlug =
    (fallback: string): FieldHook =>
        async ({ value, originalDoc, data, req, operation, collection }) => {
            if (operation === 'create' || !value) {
                const fallbackData = data?.[fallback] || originalDoc?.[fallback]

                if (fallbackData && typeof fallbackData === 'string') {
                    const date = new Date()
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const slugBase = format(`${fallbackData}-${year}-${month}`)
                    let slug = slugBase
                    let counter = 1

                    if (collection) {
                        while (true) {
                            const existing = await req.payload.find({
                                collection: collection.slug,
                                where: {
                                    slug: {
                                        equals: slug,
                                    },
                                },
                            })

                            if (existing.docs.length === 0) {
                                return slug
                            }

                            slug = `${slugBase}-${counter}`
                            counter++
                        }
                    }
                    return slug
                }
            }

            if (typeof value === 'string' && value.length > 0) {
                return format(value)
            }

            return value
        }

export default formatSlug
