/** @generated from d1.insights.settings.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/insights/settings`,
	body: "json",
} as const;
