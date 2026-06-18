import type {
	APIActionRowComponent,
	APIButtonComponentWithCustomId,
	APIChannel,
	APIEmbed,
	APIGuild,
	APIMessage,
	APIOverwrite,
} from 'discord-api-types/v10';
import { AllowedMentions } from './constants';

// MARK: API Calls

export async function api_call<T>(
	env: Env,
	endpoint: string,
	options: RequestInit = {},
): Promise<T | null> {
	const url = `https://discord.com/api/v10/${endpoint}`;
	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Bot ${env.DISCORD_TOKEN}`,
		...options.headers,
	};

	const response = await fetch(url, { ...options, headers });
	if (!response.ok) throw new Error(await response.text());

	if (response.status === 204) return null;

	return await response.json();
}

// MARK: Channels

export async function get_guild_channels(env: Env, guild_id: string) {
	return await api_call<APIChannel[]>(env, `guilds/${guild_id}/channels`);
}

export async function create_channel(
	env: Env,
	guild_id: string,
	name: string,
	type: number,
	options: {
		parent_id?: string | null;
		topic?: string | null;
		permission_overwrites?: APIOverwrite[];
	} = {},
) {
	return await api_call<APIChannel>(env, `guilds/${guild_id}/channels`, {
		method: 'POST',
		body: JSON.stringify({ name, type, ...options }),
	});
}

export async function modify_channel(
	env: Env,
	channel_id: string,
	body: {
		name?: string;
		parent_id?: string | null;
		topic?: string | null;
		permission_overwrites?: APIOverwrite[];
	},
) {
	return await api_call<APIChannel>(env, `channels/${channel_id}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
	});
}

export async function delete_channel(env: Env, channel_id: string) {
	await api_call(env, `channels/${channel_id}`, {
		method: 'DELETE',
	});
}

export async function get_channel(env: Env, channel_id: string) {
	return await api_call<APIChannel>(env, `channels/${channel_id}`);
}

// MARK: Guilds

export async function get_guild(env: Env, guild_id: string) {
	return await api_call<APIGuild>(env, `guilds/${guild_id}`);
}

export async function get_guild_member(
	env: Env,
	guild_id: string,
	user_id: string,
) {
	return await api_call<{ roles?: string[] }>(
		env,
		`guilds/${guild_id}/members/${user_id}`,
	);
}

// MARK: Messages

export async function send_message(
	env: Env,
	channel_id: string,
	content: string,
	embeds?: APIEmbed[],
	components?: APIActionRowComponent<APIButtonComponentWithCustomId>[],
) {
	return await api_call<APIMessage>(env, `channels/${channel_id}/messages`, {
		method: 'POST',
		body: JSON.stringify({
			content,
			embeds,
			components,
			allowed_mentions: AllowedMentions,
		}),
	});
}

export async function delete_message(
	env: Env,
	channel_id: string,
	message_id: string,
) {
	await api_call(env, `channels/${channel_id}/messages/${message_id}`, {
		method: 'DELETE',
	});
}
