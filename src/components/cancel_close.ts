import type {
	APIInteractionResponse,
	APIMessageComponentInteraction,
} from 'discord-api-types/v10';
import { Responses } from '../constants';
import { delete_message } from '../discord';
import {
	ephemeral,
	format_error,
	is_moderator,
	reply,
	require_ticket_channel,
} from '../helpers';

export async function cancel_close(
	env: Env,
	interaction: APIMessageComponentInteraction,
	_ctx?: ExecutionContext,
): Promise<APIInteractionResponse> {
	const req = await require_ticket_channel(env, interaction);
	if (!req.ok) return req.response;

	const { channel_id, ticket_info } = req;

	const requester_id = interaction.member?.user.id ?? interaction.user?.id;
	const is_owner = requester_id === ticket_info.owner_id;
	const is_mod = is_moderator(interaction, ticket_info.mod_role_id);
	if (!is_owner && !is_mod) return ephemeral(Responses.NoCancelClose);

	const message_id = interaction.message.id;

	try {
		await delete_message(env, channel_id, message_id);
		return reply(Responses.ClosureCancelled);
	} catch (e) {
		return ephemeral(
			`${Responses.FailedCancelClosure}: ${format_error(e)}`,
		);
	}
}
