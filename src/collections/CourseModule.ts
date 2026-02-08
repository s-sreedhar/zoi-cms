import type { CollectionConfig } from 'payload'

export const CourseModule: CollectionConfig = {
    slug: 'course-modules',
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
            name: 'course',
            type: 'relationship',
            relationTo: 'courses',
            required: true,
        },
        {
            name: 'order',
            type: 'number',
        },
    ],
}
