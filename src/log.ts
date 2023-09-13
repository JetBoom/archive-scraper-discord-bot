import pino from 'pino'

export const log = pino({ level: process.env.DEBUG ? 'trace' : 'info' })
