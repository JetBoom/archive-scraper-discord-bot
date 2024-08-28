Ever wanted to take all the discord.gg invites posted on your favorite chan-like imageboard and dump them in a discord channel for easy viewing? Well now you caaaaaan (as long as it has an archive site)!

# Installation

1. Get Node.js which can be downloaded from the [Node.js website](https://nodejs.org).
2. Create a Discord bot token at the [Discord developers website](https://discord.com/developers).
3. Create a mongoDB database. Free 512MB databases are available at the [MongoDB cloud website](https://www.mongodb.com/cloud) and are more than enough space.
4. Run in a cli `npm_install`
5. Copy or rename .env.defaults to .env
6. Fill in the variables for `DISCORD_TOKEN, DISCORD_ANNOUNCE_CHANNEL_NAME, DISCORD_BOT_OWNER, DB_HOST, DB_USER, DB_PASSWORD, and DB_COLLECTION`
6a. Optionally, replace what archive site and board names you want the bot to look at.

# Usage
Run `npm start`
