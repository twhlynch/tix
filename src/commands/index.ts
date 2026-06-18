import type {
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	APIInteractionResponse,
} from 'discord-api-types/v10';
import { Responses } from '../constants';
import { ephemeral } from '../helpers';
import { add } from './add';
import { close } from './close';
import { force_close } from './force_close';
import { remove } from './remove';
import { setup } from './setup';
import { tag } from './tag';

const slash_commands: Record<
	string,
	(
		env: Env,
		interaction: APIInteraction,
		ctx?: ExecutionContext,
	) => Promise<APIInteractionResponse>
> = {
	setup,
	add,
	remove,
	close,
	'force-close': force_close,
	tag,
};

export async function handle_command(
	interaction: APIChatInputApplicationCommandInteraction,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const command_name = interaction.data.name;
	const handler = slash_commands[command_name];

	if (handler) return Response.json(await handler(env, interaction, ctx));

	return Response.json(ephemeral(Responses.NotImplemented));
}
