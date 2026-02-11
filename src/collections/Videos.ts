import type { CollectionConfig } from 'payload'

export const Videos: CollectionConfig = {
    slug: 'videos',
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
            name: 'bunnyVideoId',
            type: 'text',
            required: true,
            admin: {
                components: {
                    Field: '/src/components/BunnyVideoUpload#BunnyVideoUpload',
                },
            },
        },
    ],
}
