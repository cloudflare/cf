/** @generated from list-hyperdrive */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/hyperdrive/configs`,
	query: ["page", "per_page"],
} as const;
