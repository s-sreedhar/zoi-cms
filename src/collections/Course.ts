import type { CollectionConfig } from 'payload'

export const Course: CollectionConfig = {
    slug: 'courses',
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
            unique: true, // Payload handles uniqueness
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
            name: 'offerTitle',
            type: 'text',
        },
        {
            name: 'offerDetails',
            type: 'textarea',
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
        {
            name: 'hidden',
            type: 'checkbox',
            defaultValue: false,
        },
    ],
}
