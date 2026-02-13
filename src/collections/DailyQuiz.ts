import type { CollectionConfig } from 'payload'
import formatSlug from '../utils/formatSlug'



export const DailyQuiz: CollectionConfig = {
    slug: 'daily-quizzes',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'date', 'batch', 'module'],
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
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
            name: 'slug',
            type: 'text',
            unique: true,
            required: true,
            admin: {
                description: 'Generated from title (editable)',
                components: {
                    Field: '/src/components/SlugField',
                },
            },
            custom: {
                watchField: 'title',
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
            name: 'description',
            type: 'richText',
        },
        {
            name: 'question',
            type: 'richText',
            required: true,
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Optional image for the quiz question.',
            },
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
                    Field: '/src/components/CorrectAnswerSelect#CorrectAnswerSelect',
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
