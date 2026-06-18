import type {
	APIInteraction,
	APIInteractionResponse,
} from 'discord-api-types/v10';
import { Responses } from '../constants';
import { delete_channel } from '../discord';
import {
	ephemeral,
	format_error,
	is_moderator,
	reply,
	require_ticket_channel,
} from '../helpers';

export const force_close = async (
	env: Env,
	interaction: APIInteraction,
	_ctx?: ExecutionContext,
): Promise<APIInteractionResponse> => {
	const req = await require_ticket_channel(env, interaction);
	if (!req.ok) return req.response;

	const { channel_id, ticket_info } = req;

	const is_mod = is_moderator(interaction, ticket_info.mod_role_id);
	if (!is_mod) return ephemeral(Responses.NoForceClose);

	try {
		await delete_channel(env, channel_id);
		return reply(Responses.TicketClosing);
	} catch (e) {
		return ephemeral(
			`${Responses.FailedDeleteChannel}: ${format_error(e)}`,
		);
	}
};
