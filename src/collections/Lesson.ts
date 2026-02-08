import type { CollectionConfig } from 'payload'
import type { Block } from 'payload'

const VideoBlock: Block = {
    slug: 'videoBlock',
    fields: [
        {
            name: 'title',
            type: 'text',
        },
        {
            name: 'videoSource',
            type: 'select',
            options: [
                { label: 'Bunny.net', value: 'bunny' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'Custom URL', value: 'custom' },
            ],
            defaultValue: 'bunny',
        },
        {
            name: 'video',
            type: 'relationship',
            relationTo: 'videos',
            admin: {
                condition: (_, siblingData) => siblingData.videoSource === 'bunny',
            },
        },
        {
            name: 'bunnyVideoId',
            type: 'text',
            admin: {
                condition: (_, siblingData) => siblingData.videoSource === 'bunny' && !siblingData.video,
                components: {
                    Field: '/components/BunnyVideoUpload#BunnyVideoUpload',
                },
                description: 'Legacy field. Use "Video" relationship for new uploads.',
            },
        },
        {
            name: 'url',
            type: 'text',
            admin: {
                condition: (_, siblingData) => siblingData.videoSource !== 'bunny',
            }
        }
    ],
}

const QuizBlock: Block = {
    slug: 'quizBlock',
    fields: [
        {
            name: 'quiz',
            type: 'relationship',
            relationTo: 'quizzes',
            required: true,
        },
    ],
}

const PDFBlock: Block = {
    slug: 'pdfBlock',
    fields: [
        {
            name: 'title',
            type: 'text',
        },
        {
            name: 'file',
            type: 'upload',
            relationTo: 'media',
            required: true,
        }
    ]
}

const RichTextBlock: Block = {
    slug: 'richTextBlock',
    fields: [
        {
            name: 'content',
            type: 'richText',
        },
    ],
}

export const Lesson: CollectionConfig = {
    slug: 'lessons',
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
            name: 'module',
            type: 'relationship',
            relationTo: 'course-modules',
            required: true,
        },
        {
            name: 'order',
            type: 'number',
        },
        {
            name: 'topics',
            type: 'array',
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'content',
                    type: 'blocks',
                    blocks: [
                        RichTextBlock,
                        VideoBlock,
                        QuizBlock,
                        PDFBlock,
                    ],
                },
                {
                    name: 'resources',
                    type: 'array',
                    fields: [
                        {
                            name: 'title',
                            type: 'text',
                        },
                        {
                            name: 'url',
                            type: 'text',
                        },
                        {
                            name: 'file',
                            type: 'upload',
                            relationTo: 'media',
                        }
                    ]
                }
            ]
        }
    ],
}
