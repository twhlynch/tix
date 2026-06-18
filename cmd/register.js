import fetch from 'node-fetch';
import { commands } from './commands.js';

const { DISCORD_TOKEN, DISCORD_APPLICATION_ID } = process.env;

const application_url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`;

const response = await fetch(application_url, {
	method: 'PUT',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bot ${DISCORD_TOKEN}`,
	},
	body: JSON.stringify(commands),
});

if (!response.ok) throw new Error(await response.text());
