import { IInvite } from '~/types/invite'
import { InviteModel } from '~/models/invite'
import { log } from '~/log'

/** @throws */
export async function getIsEmptyDatabase() : Promise<boolean> {
    const found = await InviteModel.findOne({})
    return !found
}

/** @throws */
export async function checkInvitesExist(inviteCodes: string[]) : Promise<Record<string, boolean>> {
    const invites = await InviteModel
    .find()
        .in('_id', inviteCodes)
    .select('_id')
    .limit(inviteCodes.length)
    .lean()

    const exists = {}
    for (let num of inviteCodes) exists[num] = false
    for (let result of invites) exists[result._id] = true

    return exists
}

/** @throws */
export async function addInvitesToDatabase(invites: IInvite[]) : Promise<IInvite[]> {
    const exists = await checkInvitesExist(invites.map(invite => invite._id))

    invites = invites.filter(invite => !exists[invite._id])

    const writeResult = await InviteModel
    .bulkWrite(
        invites.map(invite => ({
            insertOne: { document: invite }
        }))
    )

    log.info('First time seeing %d new invites', writeResult.insertedCount)

    return invites
}
