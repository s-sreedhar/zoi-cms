import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Enhanced Health Check Endpoint
 * 
 * Used by Cloud Run health checks and deployment verification.
 * Verifies database connectivity, environment configuration, and service health.
 * 
 * Returns:
 * - 200 OK with "healthy" status if all checks pass
 * - 200 OK with "degraded" status if service is running but with warnings
 * - 503 Service Unavailable with "unhealthy" status if critical checks fail
 */
export async function GET() {
    const startTime = Date.now()

    try {
        // Check required environment variables
        const requiredEnvVars = ['DATABASE_URL', 'PAYLOAD_SECRET']
        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

        // Check optional environment variables
        const r2Configured = !!(
            process.env.R2_ACCOUNT_ID &&
            process.env.R2_BUCKET_NAME &&
            process.env.R2_ACCESS_KEY_ID &&
            process.env.R2_SECRET_ACCESS_KEY
        )

        // Database connectivity check
        let dbStatus: 'ok' | 'error' = 'ok'
        let dbError: string | undefined
        let dbResponseTime: number | undefined

        try {
            const dbStartTime = Date.now()
            const payload = await getPayload({ config })

            // Simple query to verify database connectivity
            // Just check if we can access the database
            await payload.find({
                collection: 'users',
                limit: 1,
                depth: 0,
            })

            dbResponseTime = Date.now() - dbStartTime
            dbStatus = 'ok'
        } catch (error) {
            dbStatus = 'error'
            dbError = error instanceof Error ? error.message : 'Unknown database error'
        }

        // Determine overall health status
        let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
        let httpStatus: number

        if (dbStatus === 'error' || missingEnvVars.length > 0) {
            overallStatus = 'unhealthy'
            httpStatus = 503
        } else if (dbResponseTime && dbResponseTime > 1000) {
            // Database is slow but responsive
            overallStatus = 'degraded'
            httpStatus = 200
        } else {
            overallStatus = 'healthy'
            httpStatus = 200
        }

        const responseTime = Date.now() - startTime

        return NextResponse.json(
            {
                status: overallStatus,
                timestamp: new Date().toISOString(),
                service: 'zoi-cms',
                responseTime: `${responseTime}ms`,
                checks: {
                    database: {
                        status: dbStatus,
                        responseTime: dbResponseTime ? `${dbResponseTime}ms` : undefined,
                        error: dbError,
                    },
                    environment: {
                        status: missingEnvVars.length > 0 ? 'error' : 'ok',
                        required: requiredEnvVars,
                        missing: missingEnvVars.length > 0 ? missingEnvVars : undefined,
                        optional: {
                            r2Storage: r2Configured ? 'configured' : 'not configured',
                        },
                    },
                },
                deployment: {
                    environment: process.env.NODE_ENV || 'development',
                    nodeVersion: process.version,
                },
            },
            { status: httpStatus }
        )
    } catch (error) {
        const responseTime = Date.now() - startTime

        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                service: 'zoi-cms',
                responseTime: `${responseTime}ms`,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 503 }
        )
    }
}
