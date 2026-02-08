import type { CollectionConfig } from 'payload'

export const DailyQuiz: CollectionConfig = {
    slug: 'daily-quizzes',
    admin: {
        useAsTitle: 'date',
        defaultColumns: ['date', 'question', 'batch', 'module'],
    },
    fields: [
        {
            name: 'date',
            type: 'date',
            required: true,
            admin: {
                date: {
                    pickerAppearance: 'dayOnly',
                },
            },
        },
        {
            name: 'batch',
            type: 'relationship',
            relationTo: 'batches',
            required: true,
        },
        {
            name: 'module',
            type: 'relationship',
            relationTo: 'course-modules',
            required: true,
        },
        {
            name: 'question',
            type: 'richText',
            required: true,
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Multiple Choice', value: 'MCQ' },
                { label: 'Multiple Select', value: 'MSQ' },
                { label: 'Text', value: 'TEXT' },
                { label: 'Number', value: 'NUMBER' },
            ],
            defaultValue: 'MCQ',
            required: true,
        },
        {
            name: 'options',
            type: 'array',
            admin: {
                condition: (_, siblingData) => ['MCQ', 'MSQ'].includes(siblingData.type),
            },
            fields: [
                {
                    name: 'option',
                    type: 'text',
                    required: true,
                },
            ],
        },
        {
            name: 'correctAnswers',
            type: 'text',
            hasMany: true, // Supports array of strings
            required: true,
            admin: {
                components: {
                    Field: '/components/CorrectAnswerSelect#CorrectAnswerSelect',
                },
                description: 'Select the correct option(s).',
            },
        },
        {
            name: 'explanation',
            type: 'richText',
            admin: {
                description: 'Shown after the student answers.',
            },
        },
    ],
}
