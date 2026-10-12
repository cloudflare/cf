/** @generated from magic-transit.apps.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/apps/${request.account_app_id}`,
	body: "json",
} as const;
