import type { CollectionConfig } from 'payload'
import { googleOauthHandler } from '../endpoints/oauth'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'displayName',
  },
  auth: true,
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        const ip = req.headers.get('x-forwarded-for') || 'unknown'

        // Update session info in the background to prevent login timeout
        req.payload
          .update({
            collection: 'users',
            id: user.id,
            data: {
              activeSessionId: Math.random().toString(36).substring(2, 15),
              lastIP: ip,
              lastLogin: new Date().toISOString(),
            },
          })
          .catch((err) => {
            req.payload.logger.error(`Failed to update user session info: ${err.message}`)
          })

        return user
      }
    ]
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'superadmin' },
        { label: 'Customer', value: 'customer' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'customer',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
    },
    {
      name: 'batch',
      type: 'relationship',
      relationTo: 'batches',
    },
    {
      name: 'googleId',
      type: 'text',
      admin: {
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'streak',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastQuizDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'activeSessionId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'lastIP',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  endpoints: [
    {
      path: '/oauth/google',
      method: 'post',
      handler: googleOauthHandler,
    },
  ],
}

