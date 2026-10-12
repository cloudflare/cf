/** @generated from create-dex-rule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/rules`,
	body: "json",
} as const;
