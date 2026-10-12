/** @generated from accounts-turnstile-widget-rotate-secret */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/challenges/widgets/${request.sitekey}/rotate_secret`,
	body: "json",
} as const;
