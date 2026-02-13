import type { CollectionConfig } from 'payload'
import formatSlug from '../utils/formatSlug'



export const Workshop: CollectionConfig = {
    slug: 'workshops',
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
            name: 'status',
            type: 'select',
            options: [
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Open', value: 'open' },
                { label: 'Closed', value: 'closed' },
            ],
            defaultValue: 'upcoming',
            required: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'slug',
            type: 'text',
            unique: true,
            required: true,
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
            name: 'instructors',
            type: 'relationship',
            relationTo: 'users',
            hasMany: true,
            filterOptions: {
                role: { in: ['instructor', 'admin', 'superadmin'] },
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
