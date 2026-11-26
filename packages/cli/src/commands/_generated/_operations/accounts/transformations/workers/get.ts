/** @generated from accounts.transformations.workers.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/settings/transformations/workers/${request.script_name}`,
} as const;
