/** @generated from security-insights.partners.settings.update */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/security-center/partners/${request.partner}/settings`,
	body: "json",
} as const;
