/** @generated from accounts-turnstile-widget-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/challenges/widgets/${request.sitekey}`,
} as const;
