import {
    Client,
    Events,
    GatewayIntentBits,
    TextChannel
} from 'discord.js'
import { IInvite } from './types/invite'
import { wait } from './util'

const invitesPerMessage = 10
    , messageWaitTimeMs = 10000

export class Bot {
    client: Client
    token: string
    announceChannelId: string

    constructor(token: string, channelId: string) {
        this.token = token
        this.announceChannelId = channelId

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
            ]
        })
    }
    
    start() : Promise<void> {
        return new Promise((resolve) => {
            this.client.once(Events.ClientReady, c => {
                console.log('Bot logged in as', c.user.tag)
    
                resolve()
            })
    
            this.client.login(this.token)
        })
    }

    async broadcastNewInvites(invites: IInvite[]) : Promise<void> {
        if (invites.length === 0) return

        const channel = this.client.channels.cache.get(this.announceChannelId) as TextChannel
        if (!channel) return

        for (let i=0; i < invites.length; i += invitesPerMessage) {
            await channel.send(
                invites.slice(i, i + invitesPerMessage)
                .map(invite => `${invite.postBoard}/${invite.postNumber} - https://discord.gg/${invite.inviteCode}`)
                .join('\n')
            )

            // In case discord throttles invite messages, which it probably does since this is essentially invite spam
            await wait(messageWaitTimeMs)
        }
    }
}
