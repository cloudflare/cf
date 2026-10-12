/** @generated from cloudflare-images-list-images-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2`,
	query: [
		"continuation_token",
		"per_page",
		"sort_order",
		"creator",
		"meta.<field>[<operator>]",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
