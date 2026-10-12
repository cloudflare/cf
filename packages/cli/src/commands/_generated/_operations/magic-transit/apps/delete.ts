/** @generated from magic-transit.apps.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/apps/${request.account_app_id}`,
} as const;
