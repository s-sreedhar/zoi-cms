#!/usr/bin/env tsx
/**
 * Standalone Migration Script for Payload CMS
 * 
 * This script runs database migrations independently of the application runtime.
 * Designed for use in CI/CD pipelines and Cloud Run Jobs.
 * 
 * Usage:
 *   pnpm tsx scripts/migrate.ts
 *   pnpm run migrate
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

// Load environment variables
dotenv.config()

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function runMigrations() {
    console.log('Starting Payload CMS migrations...')
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)

    // Validate required environment variables
    const requiredEnvVars = ['DATABASE_URL', 'PAYLOAD_SECRET']
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingEnvVars.length > 0) {
        console.error('❌ Missing required environment variables:')
        missingEnvVars.forEach(varName => console.error(`   - ${varName}`))
        process.exit(1)
    }

    try {
        console.log('Initializing Payload...')

        // Initialize Payload with the config
        const payload = await getPayload({ config })

        console.log('Running migrations...')

        // Run migrations - the migrate function only accepts an optional migrations array
        // It uses the config that was already loaded during initialization
        await payload.db.migrate()

        console.log('✅ Migrations completed successfully')
        process.exit(0)
    } catch (error) {
        console.error('❌ Migration failed:')
        console.error(error)

        if (error instanceof Error) {
            console.error('\nError details:')
            console.error(`  Message: ${error.message}`)
            if (error.stack) {
                console.error(`  Stack: ${error.stack}`)
            }
        }

        process.exit(1)
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise)
    console.error('Reason:', reason)
    process.exit(1)
})

// Run migrations
runMigrations()
