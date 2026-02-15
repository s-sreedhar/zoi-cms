// payload.config.ts
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Company } from './collections/Company'
import { Media } from './collections/Media'
import { Videos } from './collections/Videos'
import { Course } from './collections/Course'
import { Batch } from './collections/Batch'
import { Workshop } from './collections/Workshop'
import { Quiz } from './collections/Quiz'
import { DailyQuiz } from './collections/DailyQuiz'
import { Problem } from './collections/Problem'
import { Session } from './collections/Session'
import { Leads } from './collections/Leads'
import { Feedback } from './collections/Feedback'
import { CourseModule } from './collections/CourseModule'
import { Lesson } from './collections/Lesson'
import { CourseProgress } from './collections/CourseProgress'
import { Announcement } from './collections/Announcement'
import { LessonNotes } from './collections/LessonNotes'
import { WorkshopRegistration } from './collections/WorkshopRegistration'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { openapi, swaggerUI } from 'payload-oapi'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Zoi Admin',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/zoi.png',
        },
      ],
      openGraph: {
        images: [
          {
            url: '/zoi.png',
          },
        ],
      },
    },
    components: {
      graphics: {
        Logo: '/src/components/CMSLogo#CMSLogo',
        Icon: '/src/components/CMSLogo#CMSIcon',
      },
      views: {
        dashboard: {
          Component: '/src/components/AdminDashboard#default',
        },
      },
    },
  },
  collections: [Users, Company, Media, Videos, Announcement, Course, Batch, Workshop, WorkshopRegistration, Quiz, DailyQuiz, Problem, Session, Feedback, Leads, CourseModule, Lesson, CourseProgress, LessonNotes],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://zoi-cms-991931824365.asia-south1.run.app',
    'https://zoi-frontend.vercel.app',
    'https://www.nuatlabs.com',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://zoi-cms-991931824365.asia-south1.run.app',
    'https://zoi-frontend.vercel.app',
    'https://www.nuatlabs.com',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  sharp,
  plugins: [
    openapi({
      openapiVersion: '3.0',
      metadata: {
        title: 'ZOI CMS API',
        version: '1.0.0',
      },
    }),
    swaggerUI({}),
    ...(process.env.R2_ACCOUNT_ID
      ? [
        s3Storage({
          collections: {
            media: true,
          },
          bucket: process.env.R2_BUCKET_NAME || '',
          config: {
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
            },
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          },
        }),
      ]
      : []),
  ],
})
