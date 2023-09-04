import {
    Client,
    Events,
    GatewayIntentBits,
    TextChannel
} from 'discord.js'
import type { Invite } from './types/invite'

function wait(time: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, time)
    })
}

export class Bot {
    client: Client
    announceChannelId: string

    constructor(token: string, channelId: string, onReady?: Function) {
        this.announceChannelId = channelId

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
            ]
        })

        this.client.once(Events.ClientReady, c => {
            console.log('Bot logged in as', c.user.tag)

            if (onReady) onReady()
        })

        this.client.login(token)
    }

    async broadcastNewInvites(invites: Invite[]) {
        if (invites.length === 0) return

        const channel = this.client.channels.cache.get(this.announceChannelId) as TextChannel
        if (!channel) return

        const numPerMessage = 10
        for (let i=0; i < invites.length; i += numPerMessage) {
            await channel.send(invites.slice(i, i + numPerMessage).join('\n'))

            // In case discord throttles invite messages, which it probably does since this is essentially invite spam
            await wait(5000)
        }
    }
}
