/** @generated from security-insights.state.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/security-center/state`,
	body: "json",
} as const;
