/** @generated from zero-trust.access.targets.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets`,
	body: "json",
} as const;
