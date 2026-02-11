import type { CollectionConfig } from 'payload'

export const Announcement: CollectionConfig = {
    slug: 'announcements',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'type', 'target', 'batch', 'createdAt'],
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
            name: 'message',
            type: 'textarea',
            required: true,
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Info', value: 'info' },
                { label: 'Alert', value: 'alert' },
                { label: 'Success', value: 'success' },
            ],
            defaultValue: 'info',
            required: true,
        },
        {
            name: 'target',
            type: 'select',
            options: [
                { label: 'All Students', value: 'all' },
                { label: 'Specific Batch', value: 'batch' },
            ],
            defaultValue: 'all',
            required: true,
        },
        {
            name: 'batch',
            type: 'relationship',
            relationTo: 'batches',
            admin: {
                condition: (_, siblingData) => siblingData.target === 'batch',
            },
        },
    ],
    timestamps: true,
}
