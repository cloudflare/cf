/** @generated from turnstile.widgets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/challenges/widgets`,
	query: ["page", "per_page", "order", "direction", "filter"],
} as const;
