import { Buffer } from 'node:buffer';
import {
	InteractionResponseType,
	type APIInteraction,
} from 'discord-api-types/v10';
import nacl from 'tweetnacl';
import { handle_command } from './commands';
import { handle_component } from './components';
import { Responses } from './constants';
import {
	is_application_command,
	is_message_component,
	is_ping,
} from './helpers';

function validate(body: string, request: Request, env: Env): boolean {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	return (
		!!signature &&
		!!timestamp &&
		nacl.sign.detached.verify(
			Buffer.from(timestamp + body),
			Buffer.from(signature, 'hex'),
			Buffer.from(env.PUBLIC_KEY, 'hex'),
		)
	);
}

async function handle_request(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	// Discord API sends POST
	if (request.method !== 'POST')
		return new Response(Responses.MethodNotAllowed, { status: 405 });

	// validate request is from Discord
	const body = await request.text();
	const verified = validate(body, request, env);
	if (!verified)
		return new Response(Responses.InvalidSignature, { status: 401 });

	const json = JSON.parse(body) as APIInteraction;

	// handle ping
	if (is_ping(json))
		return Response.json({ type: InteractionResponseType.Pong });

	// handle command
	if (is_application_command(json))
		return await handle_command(json, env, ctx);

	// handle button
	if (is_message_component(json))
		return await handle_component(env, json, ctx);

	return new Response(Responses.InvalidRequestType, { status: 400 });
}

export default {
	fetch: handle_request,
};
