import type {
	APIInteractionResponse,
	APIMessageComponentInteraction,
} from 'discord-api-types/v10';
import { Responses } from '../constants';
import { delete_channel } from '../discord';
import {
	ephemeral,
	format_error,
	is_moderator,
	parseCustomId,
	reply,
	require_ticket_channel,
} from '../helpers';

export async function confirm_close(
	env: Env,
	interaction: APIMessageComponentInteraction,
	_ctx?: ExecutionContext,
): Promise<APIInteractionResponse> {
	const id = parseCustomId(interaction.data.custom_id);
	if (!id || id.action !== 'confirm_close')
		return ephemeral(Responses.InvalidInteraction);

	const { owner_id, requester_id: original_requester_id } = id;

	const req = await require_ticket_channel(env, interaction);
	if (!req.ok) return req.response;
	const { channel_id, ticket_info } = req;

	const clicker_id = interaction.member?.user.id ?? interaction.user?.id;

	const is_original_requester_owner = original_requester_id === owner_id;

	if (is_original_requester_owner) {
		const is_clicker_mod = is_moderator(
			interaction,
			ticket_info.mod_role_id,
		);
		if (!is_clicker_mod) return ephemeral(Responses.OnlyModConfirm);
	} else {
		const is_clicker_owner = clicker_id === owner_id;
		if (!is_clicker_owner) return ephemeral(Responses.OnlyOwnerConfirm);
	}

	try {
		await delete_channel(env, channel_id);
		return reply(Responses.TicketClosing);
	} catch (e) {
		return ephemeral(
			`${Responses.FailedDeleteChannel}: ${format_error(e)}`,
		);
	}
}
