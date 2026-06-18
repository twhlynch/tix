import type {
	APIInteractionResponse,
	APIMessageComponentInteraction,
} from 'discord-api-types/v10';
import { close } from '../commands/close';
import { Responses } from '../constants';
import { ephemeral } from '../helpers';
import { cancel_close } from './cancel_close';
import { confirm_close } from './confirm_close';
import { create } from './create';

const handlers: Record<
	string,
	(
		env: Env,
		interaction: APIMessageComponentInteraction,
		ctx?: ExecutionContext,
	) => Promise<APIInteractionResponse>
> = {
	create,
	close_request: close,
	cancel_close,
	confirm_close,
};

export async function handle_component(
	env: Env,
	interaction: APIMessageComponentInteraction,
	ctx?: ExecutionContext,
) {
	const custom_id = interaction.data.custom_id;
	if (!custom_id)
		return Response.json(ephemeral(Responses.InvalidInteraction));

	const idx = custom_id.indexOf(':');
	const action = idx === -1 ? custom_id : custom_id.slice(0, idx);
	const handler = handlers[action];
	if (!handler) return Response.json(ephemeral(Responses.NotImplemented));

	return Response.json(await handler(env, interaction, ctx));
}
