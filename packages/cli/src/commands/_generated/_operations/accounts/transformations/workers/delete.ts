/** @generated from accounts.transformations.workers.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/settings/transformations/workers/${request.script_name}`,
} as const;
