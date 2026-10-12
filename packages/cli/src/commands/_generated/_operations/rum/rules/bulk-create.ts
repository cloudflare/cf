/** @generated from rum.rules.bulk-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/v2/${request.ruleset_id}/rules`,
	body: "json",
} as const;
