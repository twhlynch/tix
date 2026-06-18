const GUILD_COMMAND = { integration_types: [0], contexts: [0] };
const STRING_OPTION = { type: 3 };
const USER_OPTION = { type: 6 };
const CHANNEL_OPTION = { type: 7 };
const ROLE_OPTION = { type: 8 };

export const commands = [
	{
		name: 'setup',
		description: 'Setup ticket embed with buttons',
		options: [
			{
				name: 'mod_role',
				description: 'Role that can manage tickets',
				required: true,
				...ROLE_OPTION,
			},
			{
				name: 'category',
				description: 'Category for ticket channels',
				required: true,
				...CHANNEL_OPTION,
			},
			{
				name: 'categories',
				description: 'Comma separated list of categories',
				required: false,
				...STRING_OPTION,
			},
			{
				name: 'title',
				description: 'Custom embed title',
				required: false,
				...STRING_OPTION,
			},
			{
				name: 'description',
				description: 'Custom embed description',
				required: false,
				...STRING_OPTION,
			},
		],
		...GUILD_COMMAND,
	},
	{
		name: 'add',
		description: 'Add a user to a ticket',
		options: [
			{
				name: 'user',
				description: 'The user to add to the ticket',
				required: true,
				...USER_OPTION,
			},
		],
		...GUILD_COMMAND,
	},
	{
		name: 'remove',
		description: 'Remove a user from a ticket',
		options: [
			{
				name: 'user',
				description: 'The user to remove from the ticket',
				required: true,
				...USER_OPTION,
			},
		],
		...GUILD_COMMAND,
	},
	{
		name: 'close',
		description: 'Request to close a ticket',
		...GUILD_COMMAND,
	},
	{
		name: 'force-close',
		description: 'Force close a ticket',
		...GUILD_COMMAND,
	},
	{
		name: 'tag',
		description: 'Tag the channel name',
		options: [
			{
				name: 'emoji',
				description: 'Tag to prepend to the channel name',
				required: true,
				...STRING_OPTION,
			},
		],
		...GUILD_COMMAND,
	},
];
