/** @generated from zero-trust.access.targets.bulk-create */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets/batch`,
	body: "json",
} as const;
