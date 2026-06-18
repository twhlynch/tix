# tix

Minimal serverless Discord ticketing bot using Cloudflare Workers.

All state is stored in Discord, using button custom ids, channel topics, and interaction context.

# usage

1. Copy `.env.example` to `.env` and add your tokens from your bot at the [Discord Developer Portal](https://discord.com/developers/applications)
2. Register the application commands with `npm run register`
3. Deploy to Cloudflare Workers using `npm run publish`
4. Set the bot's `General Information -> Interactions Endpoint URL` to your worker URL (`https://tix.EXAMPLE.workers.dev`)
5. Add to your discord server with the OAuth2 URL Generator with Administrator permissions like `https://discord.com/oauth2/authorize?client_id=DISCORD_APPLICATION_ID&permissions=8&integration_type=0&scope=bot+applications.commands`

# commands

| Command       | Description                                 |
| ------------- | ------------------------------------------- |
| `setup`       | Create ticket embed and buttons             |
| `add`         | Add a user to the current ticket            |
| `remove`      | Remove a user from the current ticket       |
| `close`       | Request the other party to close the ticket |
| `force-close` | Immediately close a ticket                  |
| `tag`         | Set an emoji tag in the channel name        |

# dev

Run `wrangler types` to generate `worker-configuration.d.ts` for types completion.
