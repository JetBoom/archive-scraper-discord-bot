import { Message } from 'discord.js'
import { Bot } from '~/bot'

export default async function(bot: Bot, message: Message<boolean>) : Promise<void> {
    message.channel.send(
        bot.getAllInviteBroadcastChannels()
        .map(channel => `${channel.guild.name} - ${channel.guildId}`)
        .join('\n')
    )
}
