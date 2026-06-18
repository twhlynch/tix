import type { APIMessageComponentInteraction } from 'discord-api-types/v10';
import { Responses, SnowflakeRegex } from '../constants';
import {
	channel,
	create_ticket_channel,
	ephemeral,
	find_existing_ticket,
	format_error,
	parseCustomId,
} from '../helpers';

export async function create(
	env: Env,
	interaction: APIMessageComponentInteraction,
	_ctx?: ExecutionContext,
) {
	const id = parseCustomId(interaction.data.custom_id);
	if (!id || id.action !== 'create')
		return ephemeral(Responses.InvalidInteraction);

	const { category_id, role_id, category_name } = id;

	const valid_role = role_id && SnowflakeRegex.test(role_id);
	if (!valid_role) return ephemeral(Responses.RoleMisconfigured);

	const valid_category = category_id && SnowflakeRegex.test(category_id);
	if (!valid_category) return ephemeral(Responses.CategoryMisconfigured);

	const user = interaction.member?.user ?? interaction.user;
	if (!user) return ephemeral(Responses.NoUser);

	const guild_id = interaction.guild_id;
	if (!guild_id) return ephemeral(Responses.ServerOnly);

	const existing = await find_existing_ticket(env, guild_id, user.id);
	if (existing)
		return ephemeral(
			`${Responses.YouAlreadyHaveTicket}${channel(existing.channel_id)}`,
		);

	try {
		const channel_data = await create_ticket_channel(
			env,
			guild_id,
			user.id,
			user.username,
			category_id,
			role_id,
			category_name,
		);
		if (!channel_data) return ephemeral(`${Responses.FailedCreateTicket}.`);

		return ephemeral(
			`${Responses.TicketCreated}${channel(channel_data.id)}`,
		);
	} catch (e) {
		return ephemeral(`${Responses.FailedCreateTicket}: ${format_error(e)}`);
	}
}
