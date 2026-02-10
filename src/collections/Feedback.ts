import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
    slug: 'feedback',
    admin: {
        useAsTitle: 'name',
    },
    access: {
        read: () => true,
        create: () => true, // Creating feedback is public
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'event',
            type: 'text',
            required: true,
        },
        {
            name: 'rating',
            type: 'number',
            min: 1,
            max: 5,
            required: true,
        },
        {
            name: 'improvement',
            type: 'textarea',
        },
        {
            name: 'interests',
            type: 'array',
            fields: [
                {
                    name: 'interest',
                    type: 'text',
                },
            ],
        },
        {
            name: 'additionalComments',
            type: 'textarea',
        },
        {
            name: 'quizId',
            type: 'text',
        },
        {
            name: 'sessionId',
            type: 'text',
            index: true,
        },
        {
            name: 'difficulty',
            type: 'select',
            options: [
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' },
                { label: 'Very Hard', value: 'Very Hard' },
            ],
        },
        {
            name: 'giftPreference',
            type: 'text',
        },
        {
            name: 'contactName',
            type: 'text',
        },
        {
            name: 'contactPhone',
            type: 'text',
        },
        {
            name: 'place',
            type: 'text',
        },
        {
            name: 'howDidYouFindUs',
            type: 'text',
        },
        {
            name: 'source',
            type: 'text',
            defaultValue: 'web',
        },
    ],
}
