import type { CollectionConfig } from 'payload'

export const Company: CollectionConfig = {
    slug: 'companies',
    admin: {
        useAsTitle: 'name',
    },
    access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            unique: true,
        },
    ],
}
