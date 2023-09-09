import mongoose from 'mongoose'

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_COLLECTION,
} = process.env

export async function connectToDatabase() : Promise<typeof mongoose> {
    let url: string
    if (DB_USER && DB_PASSWORD) {
        url = `mongodb://${DB_USER}@${DB_PASSWORD}:${DB_HOST}/${DB_COLLECTION}`
    } else {
        url = `mongodb://${DB_HOST}/${DB_COLLECTION}`
    }

    return await mongoose.connect(url)
}
