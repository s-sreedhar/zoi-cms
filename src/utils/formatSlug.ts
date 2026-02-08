import type { FieldHook } from 'payload'

const format = (val: string): string =>
    val
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
        .toLowerCase()

const formatSlug =
    (fallback: string): FieldHook =>
        ({ value, originalDoc, data }) => {
            if (typeof value === 'string' && value.length > 0) {
                return format(value)
            }

            const fallbackData = data?.[fallback] || originalDoc?.[fallback]

            if (fallbackData && typeof fallbackData === 'string') {
                const date = new Date()
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                return format(`${fallbackData}-${year}-${month}`)
            }

            return value
        }

export default formatSlug
