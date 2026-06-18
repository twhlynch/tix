import {
	ButtonStyle,
	type APIInteraction,
	type APIInteractionResponse,
} from 'discord-api-types/v10';
import { Emojis, Responses } from '../constants';
import {
	action_row,
	button,
	ephemeral,
	format_error,
	is_moderator,
	mention,
	reply,
	require_ticket_channel,
	role,
} from '../helpers';

export const close = async (
	env: Env,
	interaction: APIInteraction,
	_ctx?: ExecutionContext,
): Promise<APIInteractionResponse> => {
	const req = await require_ticket_channel(env, interaction);
	if (!req.ok) return req.response;

	const { ticket_info } = req;

	const requester_id = interaction.member?.user.id ?? interaction.user?.id;
	if (!requester_id) return ephemeral(Responses.NoUser);

	const is_mod = is_moderator(interaction, ticket_info.mod_role_id);
	const is_owner = requester_id === ticket_info.owner_id;

	const is_permitted = is_mod || is_owner;
	if (!is_permitted) return ephemeral(Responses.NoClose);

	const target_mention = is_owner
		? role(ticket_info.mod_role_id ?? '')
		: mention(ticket_info.owner_id ?? '');

	const component = action_row(
		button(
			Responses.ButtonConfirmClose,
			ButtonStyle.Danger,
			{
				action: 'confirm_close',
				owner_id: ticket_info.owner_id ?? '',
				requester_id,
			},
			Emojis.ConfirmClose,
		),
		button(
			Responses.ButtonCancelClose,
			ButtonStyle.Secondary,
			{ action: 'cancel_close' },
			Emojis.CancelClose,
		),
	);

	try {
		return reply(
			`${target_mention}, ${mention(requester_id)} ${Responses.CloseRequested}`,
			{ components: [component] },
		);
	} catch (e) {
		return ephemeral(
			`${Responses.FailedRequestClosure}: ${format_error(e)}`,
		);
	}
};
