import type { CollectionConfig } from 'payload'
import formatSlug from '../utils/formatSlug'

export const Workshop: CollectionConfig = {
    slug: 'workshops',
    admin: {
        useAsTitle: 'title',
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            unique: true,
            required: true,
            admin: {
                position: 'sidebar',
                description: 'Generated from title (editable)',
            },
            hooks: {
                beforeValidate: [formatSlug('title')],
            },
        },
        {
            name: 'description',
            type: 'textarea',
            required: true,
        },
        {
            name: 'startDate',
            type: 'date',
            required: true,
        },
        {
            name: 'endDate',
            type: 'date',
        },
        {
            name: 'instructor',
            type: 'text',
        },
        {
            name: 'price',
            type: 'number',
        },
        {
            name: 'place',
            type: 'text',
            label: 'Google Maps Link',
        },
        {
            name: 'presetCollege',
            type: 'text',
        },
        {
            name: 'hidden',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'instructors',
            type: 'relationship',
            relationTo: 'users',
            hasMany: true,
            filterOptions: {
                role: { equals: 'instructor' },
            },
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'images',
            type: 'array',
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                },
            ],
        },
        {
            name: 'pdfs',
            type: 'array',
            fields: [
                {
                    name: 'pdf',
                    type: 'upload',
                    relationTo: 'media',
                },
            ],
        },
    ],
}
