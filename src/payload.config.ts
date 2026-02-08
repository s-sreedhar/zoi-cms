// payload.config.ts
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { Users } from './collections/Users'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: '/components/AdminDashboard#default',
        },
      },
    },
  },
  collections: [Users, Media, Videos, Course, Batch, Workshop, Quiz, DailyQuiz, Problem, Session, Feedback, Leads, CourseModule, Lesson, CourseProgress],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true,
  }),
  sharp,
  plugins: [
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
