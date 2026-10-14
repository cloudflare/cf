/** @generated from zero-trust.dex.commands.quota.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/commands/quota`,
} as const;
