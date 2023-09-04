import { parse as parseHTML } from 'node-html-parser'

const dayLimit = 30
const archiveSite = 'https://archiveofsins.com'
const boards = [
    'soc',
]

const msInDay = 1000 * 60 * 60 * 24
export async function scrapeArchiveInviteLinks(): Promise<string[]> {
    const startDate = new Date()
    startDate.setTime( startDate.getTime() - msInDay * dayLimit )

    const url = new URL(`${archiveSite}/_/search/boards/${boards.join('.')}/text/https%3A%2F%2Fdiscord.gg%2F/start/${startDate.toISOString().split('T')[0]}/`)

    const response = await fetch(url)
    const text = await response.text()

    const root = parseHTML(text)

    // Extract all discord invite links from the page.
    let discordInvites = Array.from(
        root.querySelectorAll('a[href*="https://discord.gg/"]').map(item => item.getAttribute('href'))
    )

    // Get rid of duplicates.
    discordInvites = Array.from(new Set(discordInvites).values())

    return discordInvites
}
