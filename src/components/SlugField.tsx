'use client'

import { useField, useAllFormFields, TextInput } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

type Props = {
    path: string
    field: any
    clientProps?: {
        watchField?: string
    }
}

const format = (val: string): string =>
    val
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
        .toLowerCase()

export default function SlugField({ path, field }: Props) {
    const { value, setValue } = useField<string>({ path })
    const watchFieldName = field.custom?.watchField || 'title'
    const [fields] = useAllFormFields()
    const watchValue = fields?.[watchFieldName]?.value as string
    const [isLocked, setIsLocked] = useState(false)

    useEffect(() => {
        // Only auto-generate if not locked and we have a watch value
        if (watchValue && !isLocked) {
            const date = new Date()
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const formattedSlug = format(`${watchValue}-${year}-${month}`)

            setValue(formattedSlug)
        }
    }, [watchValue, setValue, isLocked])

    return (
        <div className="field-type text">
            <label className="field-label">
                {field.label || 'Slug'}
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <TextInput
                        path={path}
                        value={value || ''}
                        onChange={(e: any) => {
                            setValue(e.target.value)
                            setIsLocked(true) // Lock when manually edited
                        }}
                        description={isLocked ? 'Locked for manual editing' : 'Auto-generated from title + date'}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    style={{
                        padding: '8px 12px',
                        marginTop: '0px',
                        background: isLocked ? '#dc2626' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {isLocked ? '🔒 Unlock' : '🔓 Lock'}
                </button>
            </div>
        </div>
    )
}
