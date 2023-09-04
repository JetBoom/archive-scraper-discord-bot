import 'dotenv-flow/config'
import { scrapeArchiveInviteLinks } from './scraper'
import { InviteList } from './invite-list'
import { Bot } from './bot'

const { DISCORD_TOKEN } = process.env
    , { DISCORD_ANNOUNCE_CHANNEL_ID } = process.env
    , WAIT_MINUTES = parseInt(process.env.WAIT_MINUTES)

if (Number.isNaN(WAIT_MINUTES) || WAIT_MINUTES < 0) {
    console.error('You have WAIT_MINUTES not set correctly!')
    process.exit(1)
}

const inviteList = new InviteList('invite-db.json')
inviteList.loadInviteList()

let bot: Bot
if (DISCORD_TOKEN) {
    bot = new Bot(DISCORD_TOKEN, DISCORD_ANNOUNCE_CHANNEL_ID, onBotReady)
} else {
    console.warn('No DISCORD_TOKEN found, not making a bot.')

    scrapeAndSaveTimer()
}

const delay = WAIT_MINUTES * 1000 * 60
async function scrapeAndSaveTimer() {
    const scrapedInvites = await scrapeArchiveInviteLinks()
    const newInvites = inviteList.addInvites(scrapedInvites)

    if (bot) {
        await bot.broadcastNewInvites(newInvites)
    }

    setTimeout(scrapeAndSaveTimer, delay)
}

function onBotReady() {
    scrapeAndSaveTimer()
}
