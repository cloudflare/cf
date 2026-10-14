/** @generated from zero-trust.dex.commands.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/commands`,
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
