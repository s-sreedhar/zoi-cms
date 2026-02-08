import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
    slug: 'leads',
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'phone',
            type: 'text',
        },
        {
            name: 'source',
            type: 'text',
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'New', value: 'New' },
                { label: 'Contacted', value: 'Contacted' },
                { label: 'Interested', value: 'Interested' },
                { label: 'Converted', value: 'Converted' },
                { label: 'Closed', value: 'Closed' },
            ],
            defaultValue: 'New',
        },
        {
            name: 'notes',
            type: 'textarea',
        },
        {
            name: 'place',
            type: 'text',
        },
        {
            name: 'leadHistory',
            type: 'array',
            fields: [
                {
                    name: 'action',
                    type: 'text',
                },
                {
                    name: 'date',
                    type: 'date',
                },
                {
                    name: 'details',
                    type: 'text',
                }
            ]
        },
        {
            name: 'read',
            type: 'checkbox',
            defaultValue: false,
        }
    ],
}
