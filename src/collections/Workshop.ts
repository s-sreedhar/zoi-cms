import type { CollectionConfig } from 'payload'

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
            required: true,
            unique: true,
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
