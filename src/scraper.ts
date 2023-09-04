import { parse as parseHTML, HTMLElement } from 'node-html-parser'

const dayLimit = parseInt(process.env.SEARCH_DAYS)
const archiveSite = process.env.ARCHIVE_SITE
const boards = process.env.SEARCH_BOARDS.split(',')

const msInDay = 1000 * 60 * 60 * 24
const searchText = encodeURIComponent('https://discord.gg/')

export async function scrapeArchiveInviteLinks(): Promise<string[]> {
    const startDate = new Date()
    startDate.setTime(startDate.getTime() - msInDay * dayLimit)
    const startDateString = startDate.toISOString().split('T')[0]

    let page = 1
        , discordInvites = []

    while (true) {
        const url = `${archiveSite}/_/search/boards/${boards.join('.')}/text/${searchText}/start/${startDateString}/page/${page}/`

        console.debug('Scraping page %d using URL %s', page, url)

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

    console.debug('Scrape finished with %d invites', discordInvites.length)

    return discordInvites
}
