import type { CollectionConfig } from 'payload'
import formatSlug from '../utils/formatSlug'

export const Batch: CollectionConfig = {
    slug: 'batches',
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
            name: 'slug',
            type: 'text',
            unique: true,
            required: true,
            admin: {
                position: 'sidebar',
                description: 'Generated from name (editable)',
            },
            hooks: {
                beforeValidate: [formatSlug('name')],
            },
        },
        {
            name: 'course',
            type: 'relationship',
            relationTo: 'courses',
            required: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Open', value: 'open' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Closed', value: 'closed' },
            ],
            defaultValue: 'upcoming',
            required: true,
        },
        {
            name: 'startDate',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'endDate',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'duration',
            type: 'text', // e.g., "6 Weeks"
        },
        {
            name: 'price',
            type: 'number',
            required: true,
        },
        {
            name: 'gst',
            type: 'number',
            label: 'GST (%)',
            defaultValue: 18,
        },
        {
            name: 'originalPrice',
            type: 'number',
        },
        {
            name: 'offerTitle',
            type: 'text',
        },
        {
            name: 'offerDetails',
            type: 'textarea',
        },
        {
            name: 'instructors',
            type: 'relationship',
            relationTo: 'users',
            hasMany: true,
            filterOptions: {
                role: { equals: 'instructor' },
            },
        },
        {
            name: 'hidden',
            type: 'checkbox',
            defaultValue: false,
        },
    ],
}
