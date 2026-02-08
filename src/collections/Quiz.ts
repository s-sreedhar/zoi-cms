import type { CollectionConfig } from 'payload'

export const Quiz: CollectionConfig = {
    slug: 'quizzes',
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
            type: 'textarea',
        },
        {
            name: 'isTemplate',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'questions',
            type: 'blocks',
            blocks: [
                {
                    slug: 'question', // required
                    fields: [
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
                        },
                        {
                            name: 'richText',
                            type: 'richText',
                            required: true,
                        },
                        {
                            name: 'image',
                            type: 'upload',
                            relationTo: 'media',
                        },
                        {
                            name: 'options',
                            type: 'array',
                            fields: [
                                {
                                    name: 'option',
                                    type: 'text',
                                },
                            ],
                            admin: {
                                condition: (_, siblingData) => ['MCQ', 'MSQ'].includes(siblingData.type),
                            },
                        },
                        {
                            name: 'correctAnswers',
                            type: 'text',
                            hasMany: true,
                            required: true,
                            admin: {
                                components: {
                                    Field: '/components/CorrectAnswerSelect#CorrectAnswerSelect',
                                },
                            },
                        },
                        {
                            name: 'explanation',
                            type: 'richText',
                            admin: {
                                description: 'Shown after the student answers.',
                            },
                        },
                        {
                            name: 'points',
                            type: 'number',
                            defaultValue: 1,
                        },
                        {
                            name: 'timeLimit',
                            type: 'number',
                            label: 'Time Limit (seconds)',
                        },
                    ],
                },
            ],
        },
    ],
}
