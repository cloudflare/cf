/** @generated from accounts.transformations.workers.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/settings/transformations/workers/${request.script_name}`,
	body: "json",
} as const;
