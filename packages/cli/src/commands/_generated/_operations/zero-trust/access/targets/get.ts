/** @generated from zero-trust.access.targets.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets/${request.target_id}`,
} as const;
