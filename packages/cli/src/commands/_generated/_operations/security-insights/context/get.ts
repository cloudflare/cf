/** @generated from security-insights.context.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/security-center/insights/${request.issue_id}/context`,
} as const;
