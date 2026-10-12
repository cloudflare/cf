/** @generated from billing.usage.query */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billable/usage`,
	body: "json",
} as const;
