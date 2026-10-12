/** @generated from accounts-turnstile-widget-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/challenges/widgets/${request.sitekey}`,
} as const;
