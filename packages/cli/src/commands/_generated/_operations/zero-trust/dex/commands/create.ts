/** @generated from zero-trust.dex.commands.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/commands`,
	body: "json",
} as const;
