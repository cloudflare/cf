/** @generated from rum.rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/v2/${request.ruleset_id}/rules`,
} as const;
