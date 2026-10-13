/** @generated from zero-trust.access.targets.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets/${request.target_id}`,
	body: "json",
} as const;
