/** @generated from zero-trust.dex.commands.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/dex/commands",
	query: [
		"page",
		"per_page",
		"from",
		"to",
		"device_id",
		"user_email",
		"command_type",
		"status",
	],
} as const;
