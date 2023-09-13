import mongoose from 'mongoose'
import { log } from './log'
import { wait } from './util'

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_COLLECTION,
} = process.env

/** Use atomic operations instead of document.find then document.save */
export function enforceAtomicityPlugin(schema: mongoose.Schema, options: mongoose.SchemaOptions) : void {
    schema.set('optimisticConcurrency', false)
    schema.set('versionKey', false)
    schema.set('timestamps', false)
}

export async function connectToDatabase() : Promise<typeof mongoose> {
    const uri: string = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_COLLECTION}`

    let connection: typeof mongoose

    while (!connection) {
        log.info('Connecting to database...')

        try {
            connection = await mongoose.connect(uri, {
                retryWrites: true,
                writeConcern: { w: 'majority' },
            })
        } catch (error: any) {
            log.error('Failed to connect to database, will retry.')

            await wait(5000)
        }

        log.info('Connected to database.')
    }

    return connection
}
