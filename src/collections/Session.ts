import type { CollectionConfig } from 'payload'

export const Session: CollectionConfig = {
    slug: 'sessions', // Corresponds to BatchContent
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
            name: 'batch',
            type: 'relationship',
            relationTo: 'batches',
        },
        {
            name: 'quiz',
            type: 'relationship',
            relationTo: 'quizzes',
            required: true,
        },
        {
            name: 'host',
            type: 'relationship',
            relationTo: 'users',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Waiting', value: 'WAITING' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Finished', value: 'FINISHED' },
            ],
            defaultValue: 'WAITING',
            required: true,
        },
        {
            name: 'mode',
            type: 'select',
            options: [
                { label: 'Interactive', value: 'INTERACTIVE' },
                { label: 'DIY', value: 'DIY' },
            ],
            defaultValue: 'DIY',
            required: true,
        },
        {
            name: 'totalTimeLimit',
            type: 'number',
            label: 'Total Time Limit (Seconds)',
        },
        {
            name: 'endTime',
            type: 'date', // Changed to date for better CMS handling, though backend used number timestamp
        },
        {
            name: 'startedAt',
            type: 'date',
        },
        {
            name: 'endedAt',
            type: 'date',
        },
        {
            name: 'currentQuestionIndex',
            type: 'number',
            defaultValue: -1,
        },
        {
            name: 'participants',
            type: 'json', // Using JSON for the structured participant map
            admin: {
                description: 'Map of userId to { name, score }',
            },
        },
    ],
}
