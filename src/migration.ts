import { existsSync } from 'fs'
import { readFile, rm } from 'fs/promises'
import { IInvite } from './types/invite'
import { addInvitesToDatabase } from './invite-list'

const matchRegex = /discord\.gg\/([a-zA-Z0-9-_]+)$/

export async function migrate() {
    if (!existsSync('./invite-db.json')) {
        console.log('No invites DB file found to migrate from.')
        return
    }

    console.log('Migrating old invite DB')

    const file = await readFile('./invite-db.json')
    const inviteURLs = JSON.parse(file.toString('utf-8'))
    const now = new Date()

    const invites: IInvite[] = []
    for (let url of inviteURLs) {
        const inviteCode = url.match(matchRegex)?.[1]
        if (!inviteCode) continue

        const invite: IInvite = {
            inviteCode,
            firstSeen: now,
            postBoard: 'unknown',
            postBody: '',
            postNumber: 0,
        }
        invites.push(invite)
    }

    await addInvitesToDatabase(invites)

    await rm('./invite-db.json')

    console.log('Migrated old db file successfully (%d items).', invites.length)
}
