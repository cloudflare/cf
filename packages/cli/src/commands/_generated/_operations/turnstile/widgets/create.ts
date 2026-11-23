/** @generated from turnstile.widgets.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/challenges/widgets`,
	body: "json",
} as const;
