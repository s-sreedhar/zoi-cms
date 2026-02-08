'use client'
import React, { useMemo } from 'react'
import { Select, useField, useFormFields } from '@payloadcms/ui'

type Props = {
    path: string
}

export const CorrectAnswerSelect: React.FC<Props> = ({ path }) => {
    const { value, setValue } = useField<string | string[]>({ path })

    // Determine the parent path (e.g., "questions.0" or "")
    // path is something like "questions.0.correctAnswers" or "correctAnswers"
    const parentPath = path.includes('.') ? path.split('.').slice(0, -1).join('.') : ''

    const { options, isMulti } = useFormFields(([fields, dispatch]) => {
        const result = { options: [] as { label: string, value: string }[], isMulti: false }

        // 1. Get Options
        // We look for fields that match pattern: parentPath.options.N.option
        // or just options.N.option if no parentPath
        const prefix = parentPath ? `${parentPath}.options` : 'options'

        // Iterate over keys to find options
        // This relies on the flat structure of fields in Payload's form state
        Object.keys(fields).forEach(key => {
            if (key.startsWith(prefix) && key.endsWith('.option')) {
                const field = fields[key]
                if (field && field.value && typeof field.value === 'string') {
                    result.options.push({
                        label: field.value,
                        value: field.value
                    })
                }
            }
        })

        // 2. Get Type (to determine if multi-select)
        const typePath = parentPath ? `${parentPath}.type` : 'type'
        const typeField = fields[typePath]
        if (typeField && typeField.value === 'MSQ') {
            result.isMulti = true
        }

        return result
    })

    // Map raw value to Select options
    const selectedValue = useMemo(() => {
        if (Array.isArray(value)) {
            return options.filter((o) => value.includes(o.value))
        }
        if (typeof value === 'string') {
            return options.find((o) => o.value === value) || undefined
        }
        return undefined
    }, [value, options])

    return (
        <div className="field-type select">
            <label className="field-label">Correct Answer</label>
            <Select
                options={options}
                value={selectedValue}
                onChange={(option) => {
                    // option is { value, label } or array of them
                    if (Array.isArray(option)) {
                        setValue(option.map(o => o.value))
                    } else if (option && 'value' in option) {
                        setValue(option.value)
                    } else {
                        setValue(null)
                    }
                }}
                isMulti={isMulti}
                isClearable
            />
        </div>
    )
}
