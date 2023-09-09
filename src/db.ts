import mongoose from 'mongoose'

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
    let uri: string = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_COLLECTION}`

    console.log('Connecting to database...')

    const connection = await mongoose.connect(uri, {
        retryWrites: true,
        writeConcern: { w: 'majority' },
    })

    console.log('Connected to database.')
    
    return connection
}
