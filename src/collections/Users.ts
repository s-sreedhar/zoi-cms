import type { CollectionConfig } from 'payload'
import { googleOauthHandler } from '../endpoints/oauth'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
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
  ],
  endpoints: [
    {
      path: '/oauth/google',
      method: 'post',
      handler: googleOauthHandler,
    },
  ],
}

