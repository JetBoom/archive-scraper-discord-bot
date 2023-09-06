import {
    parse as parseHTML,
    HTMLElement,
} from 'node-html-parser'

const SEARCH_DAYS = parseInt(process.env.SEARCH_DAYS)
    , SEARCH_DAYS_WHEN_EMPTY = parseInt(process.env.SEARCH_DAYS_WHEN_EMPTY ?? process.env.SEARCH_DAYS)
    , { ARCHIVE_SITE } = process.env
    , SITE_BOARDS = process.env.SEARCH_BOARDS.split(',')

const msInDay = 1000 * 60 * 60 * 24
const searchText = encodeURIComponent('https://discord.gg/')

interface ScrapeOptions {
    firstTime?: boolean
}

export async function scrapeArchiveInviteLinks(options: ScrapeOptions = {}): Promise<string[]> {
    const startDate = new Date()
    const searchDays = options.firstTime ? SEARCH_DAYS_WHEN_EMPTY : SEARCH_DAYS
    startDate.setTime(startDate.getTime() - msInDay * searchDays)
    const startDateString = startDate.toISOString().split('T')[0]

    let page = 1
        , discordInvites = []

    console.debug('Scraping started')

    while (true) {
        const url = `${ARCHIVE_SITE}/_/search/boards/${SITE_BOARDS.join('.')}/text/${searchText}/start/${startDateString}/order/asc/page/${page}/`

        let root: HTMLElement

        try {
            const response = await fetch(url)
            const text = await response.text()

            root = parseHTML(text)
        } catch (e) {
            console.error('Error parsing archive: ', e.message)
        }

        // Extract all discord invite links from the page.
        discordInvites = discordInvites.concat(
            root.querySelectorAll('a[href*="https://discord.gg/"]').map(item => item.getAttribute('href'))
        )

        // Done with all the pages?
        if (root.querySelector('div.paginate > ul > li.next.disabled')) break

        ++page
    }

    // Get rid of duplicates.
    discordInvites = Array.from(new Set(discordInvites).values())

    console.debug('Scraped up to page %d with %d unique invites', page, discordInvites.length)

    return discordInvites
}
