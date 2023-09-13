import {
    Client,
    Events,
    GatewayIntentBits,
    Message,
    TextChannel
} from 'discord.js'
import { log } from './log'
import { IInvite } from './types/invite'
import { wait } from './util'
import { AdminCommands } from './admincommands'

const {
    DISCORD_BOT_OWNER,
    DISCORD_ANNOUNCE_CHANNEL_NAME,
} = process.env

const invitesPerMessage = 10
    , messageWaitTimeMs = 5000

export class Bot {
    client: Client
    token: string

    constructor(token: string) {
        this.token = token

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
            ]
        })

        this.client.on(Events.Error, error => {
            log.error('Bot error: %s', error.message)
        })

        this.client.on(Events.MessageCreate, this.onMessageCreate)
    }

    async onMessageCreate(message: Message<boolean>) : Promise<void> {
        if (!DISCORD_BOT_OWNER || message.id !== DISCORD_BOT_OWNER) return
        
        const commandFunc = AdminCommands[message.content]
        if (commandFunc)
            await commandFunc(this, message)
        else
            message.channel.send('Admin command not found!')
    }

    async onCommand_listbroadcastchannels(message: Message<boolean>) : Promise<void> {
        message.channel.send(
            this.getAllInviteBroadcastChannels()
            .map(channel => `${channel.guild.name} - ${channel.guildId}`)
            .join('\n')
        )
    }
    
    start() : Promise<void> {
        return new Promise(resolve => {
            this.client.once(Events.ClientReady, c => {
                log.info('Bot logged in as %s', c.user.tag)
    
                resolve()
            })
    
            this.client.login(this.token)
        })
    }

    getAllInviteBroadcastChannels() : TextChannel[] {
        const channels: TextChannel[] = []

        const guilds = this.client.guilds.cache.values()
        for (const guild of guilds) {
            const channel = guild.channels.cache.find(channel => channel.name === DISCORD_ANNOUNCE_CHANNEL_NAME)
            if (channel && channel.isTextBased)
                channels.push(channel as TextChannel)
        }

        return channels
    }

    async broadcastNewInvites(invites: IInvite[]) : Promise<void> {
        if (invites.length === 0) return

        const channels = this.getAllInviteBroadcastChannels()
        for (let i=0; i < invites.length; i += invitesPerMessage) {
            const message = invites
                .slice(i, i + invitesPerMessage)
                .map(invite => `${invite.postBoard}/${invite.postNumber} - https://discord.gg/${invite.inviteCode}`)
                .join('\n')

            for (const channel of channels)
                await channel.send(message)

            // In case discord throttles invite messages, which it probably does since this is essentially invite spam
            await wait(messageWaitTimeMs)
        }
    }
}
