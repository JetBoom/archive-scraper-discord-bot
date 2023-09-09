import { Schema, model } from 'mongoose'
import { IInvite } from '../types/invite'

const inviteSchema = new Schema<IInvite>({
    inviteCode: { type: String, _id: true }
})

export const InviteModel = model<IInvite>('invite', inviteSchema)
