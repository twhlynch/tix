import {
	AllowedMentionsTypes,
	APIAllowedMentions,
	PermissionFlagsBits,
} from 'discord-api-types/v10';

export const Colors = {
	Blurple: 0x5865f2,
} as const;

export const Emojis = {
	CreateTicket: '🎫',
	RequestClose: '🔒',
	ConfirmClose: '✅',
	CancelClose: '❌',
} as const;

export const Limits = {
	ChannelName: 100,
} as const;

export const AllowedMentions: APIAllowedMentions = {
	parse: [AllowedMentionsTypes.Role, AllowedMentionsTypes.User],
} as const;

// string of [17, 20] digits
export const SnowflakeRegex = /^\d{17,20}$/;

export const Permissions = {
	ReadWrite:
		PermissionFlagsBits.ViewChannel |
		PermissionFlagsBits.SendMessages |
		PermissionFlagsBits.ReadMessageHistory,
	ReadWriteManage:
		PermissionFlagsBits.ViewChannel |
		PermissionFlagsBits.SendMessages |
		PermissionFlagsBits.ReadMessageHistory |
		PermissionFlagsBits.ManageChannels,
} as const;

// prettier-ignore
export const Responses = {
	// Embed content
	EmbedDefaultTitle:       'Create a Ticket',
	EmbedDefaultDescription: 'Use the button below to open a support ticket.',
	EmbedTicketManage:       'Use the buttons below to manage this ticket.',

	// Button labels
	ButtonRequestClose: 'Request Close',
	ButtonConfirmClose: 'Confirm Close',
	ButtonCancelClose:  'Cancel Close',
	ButtonCreateTicket: 'Create Ticket',

	// Ticket channel messages
	Welcome:              'Welcome ',
	WelcomeSuffix:        'will be with you shortly.',
	RenamedTo:            'Ticket renamed to ',
	AddedToTicket:        'Added to the ticket.',
	RemovedFromTicket:    'Removed from the ticket.',
	TicketPanelSetup:     'Ticket panel setup.',
	TicketClosing:        'Ticket is being closed...',
	ClosureCancelled:     'Closure request cancelled.',
	YouAlreadyHaveTicket: 'You already have a ticket. ',
	TicketCreated:        'Ticket created: ',
	CloseRequested:       'has requested to close this ticket. Please confirm.',

	// Missing arguments
	ServerOnly:        'Command can only be used in a server.',
	NoChannel:         'Could not identify channel.',
	NoCurrentChannel:  'Could not identify current channel.',
	NoUser:            'Could not identify user.',
	NoUserSpecified:   'No user specified.',
	NoEmoji:           'No emoji specified.',
	NoValidCategories: 'No valid categories parsed from option.',
	NoModRole:         'You must specify a moderator role.',
	NoTicketCategory:  'You must specify a ticket category.',

	// Invalid arguments
	RoleNotValid:          'Role is not valid.',
	RoleMisconfigured:     'Panel role is misconfigured.',
	CategoryNotValid:      'Category is not valid.',
	CategoryNotCategory:   'Category is not a category.',
	CategoryMisconfigured: 'Panel category is misconfigured.',
	NotTicket:             'This channel is not a ticket.',

	// Permission errors
	NoPermCommand:     'Not permitted to use this command.',
	NoClose:           'Not permitted to close ticket.',
	NoManageTickets:   'Not permitted to manage tickets.',
	NoForceClose:      'Not permitted to force close tickets.',
	NoCancelClose:     'Not permitted to cancel closure of this ticket.',
	OnlyModConfirm:    'Only a moderator can confirm this closure.',
	OnlyOwnerConfirm:  'Only the ticket owner can confirm this closure.',
	CannotRemoveMod:   'Cannot remove moderators from tickets.',
	CannotRemoveOwner: 'Cannot remove ticket owner.',

	// Failed API actions
	FailedValidateCategory: 'Failed to validate category',
	FailedSetupPanel:       'Failed to setup panel',
	FailedRequestClosure:   'Failed to request closure',
	FailedRemoveUser:       'Failed to remove user',
	FailedAddUser:          'Failed to add user',
	FailedTagTicket:        'Failed to tag ticket',
	FailedCreateTicket:     'Failed to create ticket',
	FailedCancelClosure:    'Failed to cancel closure',
	FailedDeleteChannel:    'Failed to delete channel',

	// Invalid things
	InvalidInteraction: 'Invalid interaction.',
	NotImplemented:     'Not implemented.',

	// HTTP responses
	MethodNotAllowed:   'Method not allowed',
	InvalidSignature:   'Invalid request signature',
	InvalidRequestType: 'Invalid request type',

	// Fallback
	SomethingWentWrong: 'Something went wrong.',
	RateLimited:        'Rate limited. Try again in ',
} as const;
