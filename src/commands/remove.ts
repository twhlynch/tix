import type {
	APIInteraction,
	APIInteractionResponse,
} from 'discord-api-types/v10';
import { Responses } from '../constants';
import { get_guild_member } from '../discord';
import {
	ephemeral,
	format_error,
	get_option,
	get_ticket_info,
	is_moderator,
	mention,
	remove_user_from_ticket,
	reply,
} from '../helpers';

export const remove = async (
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

	const is_owner = target_user_id === ticket_info.owner_id;
	if (is_owner) return ephemeral(Responses.CannotRemoveOwner);

	try {
		if (ticket_info.mod_role_id) {
			const member = await get_guild_member(
				env,
				guild_id,
				target_user_id,
			);
			if (member?.roles?.includes(ticket_info.mod_role_id))
				return ephemeral(Responses.CannotRemoveMod);
		}

		await remove_user_from_ticket(env, ticket_info.channel, target_user_id);
		return reply(
			`${mention(target_user_id)} ${Responses.RemovedFromTicket}`,
		);
	} catch (e) {
		return ephemeral(`${Responses.FailedRemoveUser}: ${format_error(e)}`);
	}
};
