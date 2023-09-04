import 'dotenv-flow/config'
import { scrapeArchiveInviteLinks } from './scraper'
import { InviteList } from './invite-list'

const minutes = parseInt(process.env.WAIT_MINUTES)
if (Number.isNaN(minutes) || minutes < 0) {
    console.error('You have WAIT_MINUTES not set correctly!')
    process.exit(1)
}

const inviteList = new InviteList('invite-db.json')
inviteList.loadInviteList()

const delay = minutes * 1000 * 60
async function scrapeAndSaveTimer() {
    const scrapedInvites = await scrapeArchiveInviteLinks()
    const newInvites = inviteList.addInvites(scrapedInvites)

    // discordBot.broadcast(newInvites)

    setTimeout(scrapeAndSaveTimer, delay)
}
scrapeAndSaveTimer()
