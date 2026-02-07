import type { CollectionConfig } from 'payload'

export const Batch: CollectionConfig = {
    slug: 'batches',
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
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
            name: 'bio',
            type: 'textarea',
        },
        {
            name: 'hidden',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'startDate',
            type: 'date',
        },
        {
            name: 'duration',
            type: 'text',
        },
        {
            name: 'price',
            type: 'number',
        },
        {
            name: 'originalPrice',
            type: 'number',
        },
        {
            name: 'syllabus',
            type: 'richText',
        },
        {
            name: 'curriculum',
            type: 'richText',
        },
        {
            name: 'instructor',
            type: 'text',
            defaultValue: 'Nuat Labs',
        },
        {
            name: 'offerTitle',
            type: 'text',
        },
        {
            name: 'offerDetails',
            type: 'textarea',
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
