import 'dotenv-flow/config'
import { scrapeArchiveInviteLinks } from '~/scraper'
import {
    addInvitesToDatabase,
    getIsEmptyDatabase,
} from '~/invite-list'
import { IInvite } from './types/invite'
import { Bot } from '~/bot'
import { connectToDatabase } from '~/db'
import { migrate } from '~/migration'
import { log } from '~/log'

const {
        DISCORD_TOKEN,
        DB_HOST,
    } = process.env
    , WAIT_MINUTES = parseInt(process.env.WAIT_MINUTES)

if (!DB_HOST) {
    log.fatal('You need to setup mongodb variables in .env')
    process.exit(1)
}

if (Number.isNaN(WAIT_MINUTES) || WAIT_MINUTES < 0) {
    log.fatal('You have WAIT_MINUTES not set correctly!')
    process.exit(2)
}

const scrapeDelay = WAIT_MINUTES * 1000 * 60

export class App {
    static DiscordBot: Bot

    static async start() : Promise<void> {
        await connectToDatabase()

        await migrate()

        if (DISCORD_TOKEN) {
            App.DiscordBot = new Bot(DISCORD_TOKEN)
            await App.DiscordBot.start()
        } else {
            log.warn('No DISCORD_TOKEN found, not making a bot.')
        }

        App.scrapeAndSaveTimer()
    }

    static async scrapeAndSaveTimer() : Promise<void> {
        try {
            const firstTime = await getIsEmptyDatabase()
            const scrapedInvites = await scrapeArchiveInviteLinks({ firstTime })
            const newInvites = await addInvitesToDatabase(scrapedInvites)

            if (App.DiscordBot) {
                await App.DiscordBot.broadcastNewInvites(newInvites)
            }
        } catch (err: any) {
            log.error('Error adding new invites to DB: %s', err.message)
        }
    
        setTimeout(App.scrapeAndSaveTimer, scrapeDelay)
    }
}

App.start()
