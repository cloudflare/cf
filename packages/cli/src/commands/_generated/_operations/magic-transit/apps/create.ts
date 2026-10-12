/** @generated from magic-transit.apps.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/apps`,
	body: "json",
} as const;
