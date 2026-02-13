import type { CollectionConfig } from 'payload'

export const Problem: CollectionConfig = {
    slug: 'problems',
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
            name: 'description',
            type: 'richText',
            required: true,
        },
        {
            name: 'difficulty',
            type: 'select',
            options: [
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' },
            ],
            defaultValue: 'Medium',
            required: true,
        },
        {
            name: 'template',
            type: 'richText',
        },
        {
            name: 'testbench',
            type: 'richText',
        },

        {
            name: 'companyTags',
            type: 'relationship',
            relationTo: 'companies',
            hasMany: true,
        },
    ],
}
