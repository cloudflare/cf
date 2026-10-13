/** @generated from load-balancers.searches.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/search`,
	query: ["query", "references", "page", "per_page"],
} as const;
