import { IInvite } from './types/invite'
import { InviteModel } from './models/invite'

export async function getIsEmptyDatabase() : Promise<boolean> {
    const found = await InviteModel.findOne({})
    return !found
}

export async function checkInvitesExist(inviteCodes: string[]) : Promise<Record<string, boolean>> {
    const invites = await InviteModel
        .find({ inviteCode: { $in: inviteCodes } }, 'inviteCode')
        .lean()
        .limit(inviteCodes.length)
        .exec()
    
    const exists = {}
    for (let num of inviteCodes) exists[num] = false
    for (let result of invites) exists[result.inviteCode] = true

    return exists
}

export async function addInvitesToDatabase(invites: IInvite[]) : Promise<IInvite[]> {
    const exists = await checkInvitesExist(invites.map(invite => invite.inviteCode))

    invites = invites.filter(invite => !exists[invite.inviteCode])

    const writeResult = await InviteModel.bulkWrite(
        invites.map(invite => ({
            insertOne: { document: invite }
        }))
    )

    console.info('First time seeing %d new invites', writeResult.insertedCount)

    return invites
}
