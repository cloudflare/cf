/** @generated from get-commands-eligible-devices */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/commands/devices`,
	query: ["page", "per_page", "search"],
} as const;
