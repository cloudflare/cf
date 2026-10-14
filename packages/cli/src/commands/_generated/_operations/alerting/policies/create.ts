/** @generated from alerting.policies.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/policies`,
	body: "json",
} as const;
