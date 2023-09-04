import {
    writeFileSync,
    readFileSync,
    existsSync,
} from 'fs'
import type { Invite } from './types/invite'

export class InviteList {
    fileLocation: string
    list: Set<Invite>

    constructor(location: string) {
        this.fileLocation = location
        this.list = new Set()
    }

    saveInviteList(): boolean {
        try {
            writeFileSync(
                this.fileLocation,
                JSON.stringify(
                    Array.from(this.list),
                    null,
                    2
                ),
                { encoding: 'utf-8' }
            )

            return true
        } catch (e) {
            console.error('Error writing %s: %s', this.fileLocation, e.message)

            return false
        }
    }

    loadInviteList(): boolean {
        try {
            if (!existsSync(this.fileLocation)) return true

            this.list = new Set(JSON.parse(
                readFileSync(
                    this.fileLocation,
                    { encoding: 'utf-8' }
                )
            ))

            return true
        } catch (e) {
            console.error('Error reading %s: %s', this.fileLocation, e.message)

            return false
        }
    }

    getInvites(): Invite[] {
        return Array.from(this.list)
    }

    /** Adds invites to the database and returns any invites that were not previously in the list */
    addInvites(invites: Invite[]): Invite[] {
        const newlyAdded: Invite[] = []

        for (const invite of invites) {
            if (!this.list.has(invite)) {
                this.list.add(invite)
                newlyAdded.push(invite)
            }
        }

        if (newlyAdded.length > 0) this.saveInviteList()

        console.info('First time seeing %d new invites', newlyAdded.length)

        return newlyAdded
    }
}