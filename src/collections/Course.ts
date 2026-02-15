import type { CollectionConfig } from 'payload'
import formatSlug from '../utils/formatSlug'


export const Course: CollectionConfig = {
    slug: 'courses',
    admin: {
        useAsTitle: 'title',
    },
    access: {
        read: () => true,
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
            admin: {
                position: 'sidebar',
                description: 'Generated from title (editable)',
                components: {
                    Field: '/src/components/SlugField',
                },
            },
            custom: {
                watchField: 'title',
            },
            hooks: {
                beforeValidate: [formatSlug('title')],
            },
        },
        {
            name: 'description',
            type: 'richText',
            required: true,
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
