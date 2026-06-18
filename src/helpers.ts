import {
	ButtonStyle,
	ChannelType,
	ComponentType,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
	OverwriteType,
	PermissionFlagsBits,
	type APIActionRowComponent,
	type APIButtonComponentWithCustomId,
	type APIChannel,
	type APIChatInputApplicationCommandInteraction,
	type APIChatInputApplicationCommandInteractionData,
	type APIEmbed,
	type APIGuildChannel,
	type APIInteraction,
	type APIInteractionResponse,
	type APIInteractionResponseCallbackData,
	type APIMessageComponentInteraction,
	type APIPingInteraction,
} from 'discord-api-types/v10';
import {
	AllowedMentions,
	Colors,
	Emojis,
	Limits,
	Permissions,
	Responses,
} from './constants';
import {
	create_channel,
	get_channel,
	get_guild,
	get_guild_channels,
	modify_channel,
	send_message,
} from './discord';

export function get_option(
	interaction: APIInteraction,
	name: string,
): string | undefined {
	const data =
		interaction.data as APIChatInputApplicationCommandInteractionData | null;

	const options = data?.options;
	if (!options) return undefined;

	const option = options.find((o) => o.name === name);
	if (!option || !('value' in option)) return undefined;

	return String(option.value);
}

// MARK: Responses

function discord_response(
	data: Partial<APIInteractionResponseCallbackData>,
): APIInteractionResponse {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: { allowed_mentions: AllowedMentions, ...data },
	};
}

export function ephemeral(content: string, ...embeds: APIEmbed[]) {
	return discord_response({ content, embeds, flags: MessageFlags.Ephemeral });
}

export function reply(
	content: string,
	options?: {
		embeds?: APIEmbed[];
		components?: APIActionRowComponent<APIButtonComponentWithCustomId>[];
	},
) {
	return discord_response({ content, ...options });
}

// MARK: permissions

export function is_admin(interaction: APIInteraction) {
	const permissions = interaction.member?.permissions;
	if (!permissions) return false;

	const permission_flags = BigInt(permissions);
	return (
		(permission_flags & PermissionFlagsBits.Administrator) !== 0n ||
		(permission_flags & PermissionFlagsBits.ManageChannels) !== 0n ||
		(permission_flags & PermissionFlagsBits.ManageGuild) !== 0n
	);
}

export async function is_guild_owner(env: Env, interaction: APIInteraction) {
	const guild_id = interaction.guild_id;
	if (!guild_id) return false;
	try {
		const guild = await get_guild(env, guild_id);
		const user_id = interaction.member?.user.id ?? interaction.user?.id;
		return !!(guild && guild.owner_id === user_id);
	} catch {
		return false;
	}
}

export function is_moderator(
	interaction: APIInteraction,
	mod_role_id?: string,
) {
	if (is_admin(interaction)) return true;

	const roles = interaction.member?.roles;
	if (!roles) return false;

	if (mod_role_id && roles.includes(mod_role_id)) return true;
	return false;
}

// MARK: String Formatting

export function mention(string: string) {
	return `<@${string}>`;
}

export function channel(string: string) {
	return `<#${string}>`;
}

export function role(string: string) {
	return `<@&${string}>`;
}

export function format_error(e: unknown) {
	const msg = e instanceof Error ? e.message : String(e);

	try {
		const body = JSON.parse(msg) as {
			message?: string;
			retry_after?: number;
			errors?: Record<string, { _errors?: { message?: string }[] }>;
		};

		if (body.retry_after)
			return `${Responses.RateLimited}${Math.ceil(body.retry_after)} seconds.`;

		const parts: string[] = [];
		if (body.message) parts.push(body.message);
		if (body.errors) {
			for (const [field, err] of Object.entries(body.errors)) {
				const m =
					err._errors?.map((x) => x.message).filter(Boolean) ?? [];
				if (m.length) parts.push(`${field}: ${m.join(', ')}`);
			}
		}

		if (parts.length) return parts.join(' | ');
	} catch {
		// pass
	}

	return Responses.SomethingWentWrong;
}

// MARK: Tickets

export function parse_topic_config(topic: string | null | undefined) {
	if (!topic) return {};
	const config: Record<string, string> = {};

	const parts = topic.split(';');
	for (const part of parts) {
		const [key, val] = part.split(':');
		if (key && val) config[key.trim()] = val.trim();
	}

	return config;
}

export async function get_ticket_info(env: Env, channel_id: string) {
	try {
		const channel = await get_channel(env, channel_id);
		if (!channel) return null;

		if (channel.type !== ChannelType.GuildText) return null;

		const config = parse_topic_config(channel.topic ?? null);
		if (!config['tix-owner'] && !config.tix_owner) return null;

		return {
			owner_id: config['tix-owner'] ?? config.tix_owner,
			mod_role_id: config['tix-mod-role'] ?? config.tix_mod_role,
			channel,
		};
	} catch {
		return null;
	}
}

export async function require_ticket_channel(
	env: Env,
	interaction: APIInteraction,
) {
	const guild_id = interaction.guild_id;
	if (!guild_id)
		return {
			ok: false as const,
			response: ephemeral(Responses.ServerOnly),
		};

	const channel_id = interaction.channel?.id;
	if (!channel_id)
		return {
			ok: false as const,
			response: ephemeral(Responses.NoChannel),
		};

	const ticket_info = await get_ticket_info(env, channel_id);
	if (!ticket_info) {
		return {
			ok: false as const,
			response: ephemeral(Responses.NotTicket),
		};
	}

	return { ok: true as const, guild_id, channel_id, ticket_info };
}

export async function find_existing_ticket(
	env: Env,
	guild_id: string,
	user_id: string,
) {
	try {
		const channels = await get_guild_channels(env, guild_id);
		if (!channels) return null;

		for (const ch of channels) {
			if (ch.type !== ChannelType.GuildText) continue;

			const topic = 'topic' in ch ? (ch.topic as string | null) : null;
			const config = parse_topic_config(topic);
			const owner = config['tix-owner'] ?? config.tix_owner;

			if (owner === user_id) {
				return { channel_id: ch.id };
			}
		}
	} catch {
		// ignore
	}
	return null;
}

export async function create_ticket_channel(
	env: Env,
	guild_id: string,
	user_id: string,
	username: string,
	category_id: string,
	role_id: string,
	category_name?: string,
) {
	const base = category_name
		? `tix-${category_name
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^a-z0-9-]/g, '')}`
		: 'tix';
	const suffix = username.toLowerCase().replace(/[^a-z0-9]/g, '');
	const channel_name = `${base}-${suffix}`.slice(0, Limits.ChannelName);

	const overwrites = [
		{
			id: guild_id,
			type: OverwriteType.Role,
			allow: '0',
			deny: `${PermissionFlagsBits.ViewChannel}`,
		},
		{
			id: user_id,
			type: OverwriteType.Member,
			allow: `${Permissions.ReadWrite}`,
			deny: '0',
		},
		{
			id: role_id,
			type: OverwriteType.Role,
			allow: `${Permissions.ReadWrite}`,
			deny: '0',
		},
		{
			id: env.DISCORD_APPLICATION_ID,
			type: OverwriteType.Member,
			allow: `${Permissions.ReadWriteManage}`,
			deny: '0',
		},
	];

	const channel = await create_channel(
		env,
		guild_id,
		channel_name,
		ChannelType.GuildText,
		{
			parent_id: category_id,
			topic: `tix-owner:${user_id};tix-mod-role:${role_id}`,
			permission_overwrites: overwrites,
		},
	);
	if (!channel) return null;

	await send_message(
		env,
		channel.id,
		`${Responses.Welcome}${mention(user_id)}! A ${role(role_id)} ${Responses.WelcomeSuffix}`,
		[
			{
				description: Responses.EmbedTicketManage,
				color: Colors.Blurple,
			},
		],
		[
			action_row(
				button(
					Responses.ButtonRequestClose,
					ButtonStyle.Secondary,
					{ action: 'close_request' },
					Emojis.RequestClose,
				),
			),
		],
	);

	return channel;
}

export async function add_user_to_ticket(
	env: Env,
	channel: APIChannel,
	user_id: string,
) {
	const overwrites = (channel as APIGuildChannel).permission_overwrites ?? [];
	const updated = overwrites.filter((o) => o.id !== user_id);
	updated.push({
		id: user_id,
		type: OverwriteType.Member,
		allow: `${Permissions.ReadWrite}`,
		deny: '0',
	});
	await modify_channel(env, channel.id, { permission_overwrites: updated });
}

export async function remove_user_from_ticket(
	env: Env,
	channel: APIChannel,
	user_id: string,
) {
	const overwrites = (channel as APIGuildChannel).permission_overwrites ?? [];
	const updated = overwrites.filter((o) => o.id !== user_id);
	await modify_channel(env, channel.id, { permission_overwrites: updated });
}

// MARK: Interaction Types

export function is_application_command(
	json: APIInteraction,
): json is APIChatInputApplicationCommandInteraction {
	return json.type === InteractionType.ApplicationCommand;
}

export function is_message_component(
	json: APIInteraction,
): json is APIMessageComponentInteraction {
	return json.type === InteractionType.MessageComponent;
}

export function is_ping(json: APIInteraction): json is APIPingInteraction {
	return json.type === InteractionType.Ping;
}

// MARK: Buttons

export function button(
	label: string,
	style:
		| ButtonStyle.Danger
		| ButtonStyle.Primary
		| ButtonStyle.Secondary
		| ButtonStyle.Success,
	custom_id: ParsedCustomId,
	emoji: (typeof Emojis)[keyof typeof Emojis],
): APIButtonComponentWithCustomId {
	return {
		type: ComponentType.Button,
		style,
		label,
		custom_id: encodeCustomId(custom_id),
		emoji: { name: emoji },
	};
}

export function action_row(
	...buttons: APIButtonComponentWithCustomId[]
): APIActionRowComponent<APIButtonComponentWithCustomId> {
	return { type: ComponentType.ActionRow, components: buttons };
}

// MARK: Custom IDs

const CUSTOM_IDS = {
	create: ['category_id', 'role_id', 'category_name'],
	confirm_close: ['owner_id', 'requester_id'],
	close_request: [],
	cancel_close: [],
} as const;

type ParsedCustomId = {
	[K in keyof typeof CUSTOM_IDS]: { action: K } & {
		[P in (typeof CUSTOM_IDS)[K][number]]: string;
	};
}[keyof typeof CUSTOM_IDS];

export function parseCustomId(customId: string): ParsedCustomId | null {
	const colon = customId.indexOf(':');
	const action = colon === -1 ? customId : customId.slice(0, colon);
	const rest = colon === -1 ? '' : customId.slice(colon + 1);

	const fields = CUSTOM_IDS[action as keyof typeof CUSTOM_IDS];

	const values = rest ? rest.split(':') : [];
	const payload: Record<string, string> = {};
	for (let i = 0; i < fields.length; i++) {
		payload[fields[i] as string] = values[i] ?? '';
	}

	return { action, ...payload } as ParsedCustomId;
}

export function encodeCustomId(id: ParsedCustomId): string {
	const fields = CUSTOM_IDS[id.action];
	if (!fields.length) return id.action;

	return `${id.action}:${fields.map((f) => (id as Record<string, string>)[f]).join(':')}`;
}
