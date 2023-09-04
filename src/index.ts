import { scrapeArchiveInviteLinks } from './scraper'

async function test() {
    const scraped = await scrapeArchiveInviteLinks()
    console.log('Scraped', scraped.join('\n'))
}

test()
