import type {
	APIInteraction,
	APIInteractionResponse,
} from 'discord-api-types/v10';
import { Limits, Responses } from '../constants';
import { modify_channel } from '../discord';
import {
	ephemeral,
	format_error,
	get_option,
	is_moderator,
	reply,
	require_ticket_channel,
} from '../helpers';

export const tag = async (
	env: Env,
	interaction: APIInteraction,
	_ctx?: ExecutionContext,
): Promise<APIInteractionResponse> => {
	const req = await require_ticket_channel(env, interaction);
	if (!req.ok) return req.response;

	const { channel_id, ticket_info } = req;

	const is_mod = is_moderator(interaction, ticket_info.mod_role_id);
	if (!is_mod) return ephemeral(Responses.NoManageTickets);

	const emoji = get_option(interaction, 'emoji');
	if (!emoji) return ephemeral(Responses.NoEmoji);

	let base_name = ticket_info.channel.name;
	const match = base_name.match(/^(?:[^\w\s]+-)?(tix(?:-.+)?)$/u);
	if (match?.[1]) base_name = match[1];

	const new_name = `${emoji}-${base_name}`.slice(0, Limits.ChannelName);

	try {
		await modify_channel(env, channel_id, { name: new_name });
		return reply(`${Responses.RenamedTo}**${new_name}**.`);
	} catch (e: unknown) {
		return ephemeral(`${Responses.FailedTagTicket}: ${format_error(e)}`);
	}
};
