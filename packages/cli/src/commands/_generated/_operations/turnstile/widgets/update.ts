/** @generated from accounts-turnstile-widget-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/challenges/widgets/${request.sitekey}`,
	body: "json",
} as const;
