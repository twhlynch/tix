import type {
	APIInteraction,
	APIInteractionResponse,
} from 'discord-api-types/v10';
import { Responses } from '../constants';
import {
	add_user_to_ticket,
	ephemeral,
	format_error,
	get_option,
	get_ticket_info,
	is_moderator,
	mention,
	reply,
} from '../helpers';

export const add = async (
	env: Env,
	interaction: APIInteraction,
	_ctx?: ExecutionContext,
): Promise<APIInteractionResponse> => {
	const guild_id = interaction.guild_id;
	if (!guild_id) return ephemeral(Responses.ServerOnly);

	const channel_id = interaction.channel?.id;
	if (!channel_id) return ephemeral(Responses.NoCurrentChannel);

	const target_user_id = get_option(interaction, 'user');
	if (!target_user_id) return ephemeral(Responses.NoUserSpecified);

	const ticket_info = await get_ticket_info(env, channel_id);
	if (!ticket_info) return ephemeral(Responses.NotTicket);

	const is_mod = is_moderator(interaction, ticket_info.mod_role_id);
	if (!is_mod) return ephemeral(Responses.NoManageTickets);

	try {
		await add_user_to_ticket(env, ticket_info.channel, target_user_id);
		return reply(`${mention(target_user_id)} ${Responses.AddedToTicket}`);
	} catch (e) {
		return ephemeral(`${Responses.FailedAddUser}: ${format_error(e)}`);
	}
};
