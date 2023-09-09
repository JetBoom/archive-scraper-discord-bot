import { Schema, model } from 'mongoose'
import { IInvite } from '../types/invite'
import { enforceAtomicityPlugin } from '../db'

const InviteSchema = new Schema<IInvite>({
    inviteCode: { type: String, _id: true }
})
InviteSchema.plugin(enforceAtomicityPlugin)

export const InviteModel = model<IInvite>('invite', InviteSchema)
