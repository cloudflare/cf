/** @generated from zero-trust.access.targets.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets/${request.target_id}`,
	response: false,
} as const;
