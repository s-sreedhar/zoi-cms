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
            name: 'source',
            type: 'text',
            defaultValue: 'web',
        },
    ],
}
