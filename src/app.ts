import 'dotenv-flow/config'
import { scrapeArchiveInviteLinks } from './scraper'
import {
    addInvitesToDatabase,
    getIsEmptyDatabase,
} from './invite-list'
import { Bot } from './bot'
import { connectToDatabase } from './db'

const {
        DISCORD_TOKEN,
        DISCORD_ANNOUNCE_CHANNEL_ID,
        DB_HOST,
    } = process.env
    , WAIT_MINUTES = parseInt(process.env.WAIT_MINUTES)

if (!DB_HOST) {
    console.error('You need to setup mongodb variables in .env')
    process.exit(1)
}

if (Number.isNaN(WAIT_MINUTES) || WAIT_MINUTES < 0) {
    console.error('You have WAIT_MINUTES not set correctly!')
    process.exit(2)
}

const scrapeDelay = WAIT_MINUTES * 1000 * 60

export class App {
    static DiscordBot: Bot

    static async start() : Promise<void> {
        await connectToDatabase()

        if (DISCORD_TOKEN) {
            App.DiscordBot = new Bot(DISCORD_TOKEN, DISCORD_ANNOUNCE_CHANNEL_ID)
            await App.DiscordBot.start()
        } else {
            console.warn('No DISCORD_TOKEN found, not making a bot.')
        }

        App.scrapeAndSaveTimer()
    }

    static async scrapeAndSaveTimer() : Promise<void> {
        const firstTime = await getIsEmptyDatabase()
        const scrapedInvites = await scrapeArchiveInviteLinks({ firstTime })
        const newInvites = await addInvitesToDatabase(scrapedInvites)
    
        if (App.DiscordBot) {
            await App.DiscordBot.broadcastNewInvites(newInvites)
        }
    
        setTimeout(App.scrapeAndSaveTimer, scrapeDelay)
    }
}

App.start()
