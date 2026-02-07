import type { CollectionConfig } from 'payload'

export const Session: CollectionConfig = {
    slug: 'sessions', // Corresponds to BatchContent
    admin: {
        useAsTitle: 'title',
    },
    fields: [
        {
            name: 'batch',
            type: 'relationship',
            relationTo: 'batches',
            required: true,
        },
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'description',
            type: 'richText',
        },
        {
            name: 'date',
            type: 'date',
        },
        {
            name: 'videoUrl',
            type: 'text',
            label: 'Video URL (HLS)',
        },
        {
            name: 'videoOriginalUrl',
            type: 'text',
            label: 'Original Video URL',
        },
        {
            name: 'processingStatus',
            type: 'select',
            options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Processing', value: 'PROCESSING' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Failed', value: 'FAILED' },
            ],
            defaultValue: 'PENDING',
        },
        {
            name: 'processingError',
            type: 'text',
        },
        {
            name: 'attachments',
            type: 'array',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                },
                {
                    name: 'file',
                    type: 'upload',
                    relationTo: 'media',
                },
                {
                    name: 'type',
                    type: 'select',
                    options: ['pdf', 'doc', 'image', 'other'],
                    defaultValue: 'other',
                },
            ],
        },
        {
            name: 'isPublished',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'tags', // Added tags as it was in the model
            type: 'array',
            fields: [
                {
                    name: 'tag',
                    type: 'text',
                },
            ],
        },
    ],
}
