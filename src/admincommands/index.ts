import { Message } from 'discord.js'
import { Bot } from '~/bot'
import listbroadcastchannels from './listbroadcastchannels'

export const AdminCommands: Record< string, (bot: Bot, message: Message<boolean>) => Promise<void> > = {
    listbroadcastchannels,
}
