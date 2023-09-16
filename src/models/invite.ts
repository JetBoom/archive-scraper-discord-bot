import { Schema, model } from 'mongoose'
import { IInvite } from '~/types/invite'
import { enforceAtomicityPlugin } from '~/db'

const InviteSchema = new Schema<IInvite>({
    _id: { type: String, required: true, uninque: true, _id: true },
    firstSeen: Date,
    postBoard: String,
    postBody: String,
    postNumber: Number,
})
InviteSchema.plugin(enforceAtomicityPlugin)

export const InviteModel = model<IInvite>('invite', InviteSchema)
