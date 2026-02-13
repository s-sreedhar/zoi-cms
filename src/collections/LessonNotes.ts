import type { CollectionConfig } from 'payload'

export const LessonNotes: CollectionConfig = {
    slug: 'lesson-notes',
    admin: {
        useAsTitle: 'id',
    },
    access: {
        read: ({ req: { user } }) => {
            if (user?.role === 'admin' || user?.role === 'superadmin') return true
            return {
                user: { equals: user?.id },
            }
        },
        create: () => true,
        update: ({ req: { user } }) => {
            if (user?.role === 'admin' || user?.role === 'superadmin') return true
            return {
                user: { equals: user?.id },
            }
        },
        delete: ({ req: { user } }) => {
            if (user?.role === 'admin' || user?.role === 'superadmin') return true
            return {
                user: { equals: user?.id },
            }
        },
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            defaultValue: ({ user }: any) => user?.id,
        },
        {
            name: 'lesson',
            type: 'relationship',
            relationTo: 'lessons',
            required: true,
        },
        {
            name: 'batch',
            type: 'relationship',
            relationTo: 'batches',
            admin: {
                description: 'Optional: Restrict note to specific batch',
            },
        },
        {
            name: 'content',
            type: 'richText',
            required: true,
        },
    ],
}
