import type { CollectionConfig } from 'payload'

export const CourseProgress: CollectionConfig = {
    slug: 'course-progress',
    admin: {
        useAsTitle: 'id',
        hidden: true, // Internal use mainly
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
        },
        {
            name: 'course',
            type: 'relationship',
            relationTo: 'courses',
        },
        {
            name: 'lesson',
            type: 'relationship',
            relationTo: 'lessons',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Not Started', value: 'NOT_STARTED' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Completed', value: 'COMPLETED' },
            ],
            defaultValue: 'NOT_STARTED',
        },
        {
            name: 'completedAt',
            type: 'date',
        },
    ],
}
