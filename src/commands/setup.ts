import {
	APIActionRowComponent,
	APIButtonComponentWithCustomId,
	ButtonStyle,
	ChannelType,
	type APIInteraction,
	type APIInteractionResponse,
} from 'discord-api-types/v10';
import { Colors, Emojis, Responses, SnowflakeRegex } from '../constants';
import { get_channel, send_message } from '../discord';
import {
	action_row,
	button,
	ephemeral,
	format_error,
	get_option,
	is_guild_owner,
} from '../helpers';

export const setup = async (
	env: Env,
	interaction: APIInteraction,
	_ctx?: ExecutionContext,
): Promise<APIInteractionResponse> => {
	const is_owner = await is_guild_owner(env, interaction);
	if (!is_owner) return ephemeral(Responses.NoPermCommand);

	const guild_id = interaction.guild_id;
	if (!guild_id) return ephemeral(Responses.ServerOnly);

	const channel_id = interaction.channel?.id;
	if (!channel_id) return ephemeral(Responses.NoChannel);

	const role_id = get_option(interaction, 'mod_role');
	if (!role_id) return ephemeral(Responses.NoModRole);

	const valid_role = SnowflakeRegex.test(role_id.trim());
	if (!valid_role) return ephemeral(Responses.RoleNotValid);

	const category_id = get_option(interaction, 'category');
	if (!category_id) return ephemeral(Responses.NoTicketCategory);

	const valid_category = SnowflakeRegex.test(category_id.trim());
	if (!valid_category) return ephemeral(Responses.CategoryNotValid);

	try {
		const cat = await get_channel(env, category_id.trim());
		if (!cat || cat.type !== ChannelType.GuildCategory)
			return ephemeral(Responses.CategoryNotValid);
	} catch (e) {
		return ephemeral(
			`${Responses.FailedValidateCategory}: ${format_error(e)}`,
		);
	}

	const categories_str = get_option(interaction, 'categories');
	const category_list: { name: string; id: string }[] = [];
	if (categories_str) {
		const words = categories_str.split(',');
		for (const word of words) {
			const trimmed_word = word.trim();
			if (trimmed_word) {
				category_list.push({
					name: trimmed_word,
					id: category_id.trim(),
				});
			}
		}
	} else {
		category_list.push({
			name: Responses.ButtonCreateTicket,
			id: category_id.trim(),
		});
	}

	if (category_list.length === 0)
		return ephemeral(Responses.NoValidCategories);

	const title =
		get_option(interaction, 'title') ?? Responses.EmbedDefaultTitle;
	const description =
		get_option(interaction, 'description') ??
		Responses.EmbedDefaultDescription;

	const components: APIActionRowComponent<APIButtonComponentWithCustomId>[] =
		[];
	for (let i = 0; i < category_list.length; i += 5) {
		components.push(
			action_row(
				...category_list.slice(i, i + 5).map((cat) =>
					button(
						cat.name,
						ButtonStyle.Primary,
						{
							action: 'create',
							category_id: cat.id,
							role_id: role_id.trim(),
							category_name: cat.name,
						},
						Emojis.CreateTicket,
					),
				),
			),
		);
	}

	const embed = [{ title, description, color: Colors.Blurple }];

	try {
		await send_message(env, channel_id, '', embed, components);
		return ephemeral(Responses.TicketPanelSetup);
	} catch (e) {
		return ephemeral(`${Responses.FailedSetupPanel}: ${format_error(e)}`);
	}
};
