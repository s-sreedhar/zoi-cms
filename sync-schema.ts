import dotenv from 'dotenv'
dotenv.config()

async function sync() {
    const { default: payload } = await import('payload')
    const { default: config } = await import('./src/payload.config')

    await payload.init({
        config: config,
    })
    console.log('Payload initialized and schema synced via push: true')
    process.exit(0)
}

sync()
