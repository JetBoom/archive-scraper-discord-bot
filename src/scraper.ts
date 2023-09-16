import {
    parse as parseHTML,
    HTMLElement,
} from 'node-html-parser'
import { log } from '~/log'
import { IInvite } from '~/types/invite'

const SEARCH_DAYS = parseInt(process.env.SEARCH_DAYS)
    , SEARCH_DAYS_WHEN_EMPTY = parseInt(process.env.SEARCH_DAYS_WHEN_EMPTY || process.env.SEARCH_DAYS)
    , { ARCHIVE_SITE } = process.env
    , SITE_BOARDS = process.env.SEARCH_BOARDS.split(',')

const msInDay = 1000 * 60 * 60 * 24
    , searchText = encodeURIComponent('https://discord.gg/')
    , matchRegex = /discord\.gg\/([a-zA-Z0-9-_\w]+)/m

/** @throws */
function extractInviteFromPost(post: HTMLElement) : IInvite | null {
    const inviteCode = post.querySelector('div.text').innerHTML.match(matchRegex)?.[1]
    if (!inviteCode) {
        log.warn('No invite code found in post %s', post.id)
        return
    }

    const invite: IInvite = {
        _id: inviteCode,
        postNumber: parseInt(post.getAttribute('id')),
        firstSeen: new Date(),
        postBoard: post.getAttribute('data-board'),
        postBody: post.querySelector('div.text').innerHTML,
    }

    return invite
}

function getSearchStartDateStr(firstTime?: boolean) : string {
    const startDate = new Date()
    const searchDays = firstTime ? SEARCH_DAYS_WHEN_EMPTY : SEARCH_DAYS

    startDate.setTime(startDate.getTime() - msInDay * searchDays)

    return startDate.toISOString().split('T')[0]
}

interface ScrapeOptions {
    firstTime?: boolean
}

export async function scrapeArchiveInviteLinks(options: ScrapeOptions = {}) : Promise<IInvite[]> {
    const startDateString = getSearchStartDateStr(options.firstTime)
    const discordInviteMap = new Map<string, IInvite>()

    log.debug('Scraping started')

    let page = 1
    while (true) {
        const url = `${ARCHIVE_SITE}/_/search/boards/${SITE_BOARDS.join('.')}/text/${searchText}/start/${startDateString}/order/asc/page/${page}/`

        let root: HTMLElement

        try {
            const response = await fetch(url)
            const text = await response.text()

            root = parseHTML(text)
        } catch (e) {
            log.error('Error parsing archive: %s', e.message)
            break
        }

        // Extract all discord invite links from the page.
        const posts = root.querySelectorAll('aside.posts > article[id]')
        for (const post of posts) {
            try {
                const invite = extractInviteFromPost(post)
                if (invite)
                    discordInviteMap.set(invite._id, invite)
            } catch (e: any) {
                log.warn('Could not parse post %s', post.getAttribute('id'))
            }
        }

        // Done with all the pages?
        if (root.querySelector('div.paginate > ul > li.next.disabled')) break

        ++page
    }

    const discordInvites = Array.from(discordInviteMap.values())

    log.debug('Scraped up to page %d with %d unique invites', page, discordInvites.length)

    return discordInvites
}
