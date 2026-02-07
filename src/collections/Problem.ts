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
        },
        {
            name: 'template',
            type: 'code',
            admin: {
                language: 'javascript',
            },
        },
        {
            name: 'testbench',
            type: 'code',
            admin: {
                language: 'javascript',
            },
        },
        {
            name: 'testCases',
            type: 'json',
        },
    ],
}
