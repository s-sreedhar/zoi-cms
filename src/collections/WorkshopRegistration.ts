import type { CollectionConfig } from 'payload'

export const WorkshopRegistration: CollectionConfig = {
    slug: 'workshop-registrations',
    admin: {
        useAsTitle: 'name',
    },
    access: {
        create: () => true,
        read: () => true,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'rollNumber',
            type: 'text',
            required: true,
        },
        {
            name: 'email',
            type: 'email',
            required: true,
        },
        {
            name: 'howDidYouKnow',
            type: 'select',
            required: true,
            options: [
                { label: 'Social Media', value: 'social_media' },
                { label: 'Friend/Colleague', value: 'friend' },
                { label: 'College Announcement', value: 'college' },
                { label: 'Other', value: 'other' },
            ],
        },
        {
            name: 'workshop',
            type: 'relationship',
            relationTo: 'workshops',
            required: true,
        },
        {
            name: 'venue',
            type: 'text',
            admin: {
                readOnly: true,
            },
        },
    ],
}
