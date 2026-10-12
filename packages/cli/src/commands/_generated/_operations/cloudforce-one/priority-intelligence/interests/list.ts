/** @generated from get_PirInterestList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/interests`,
	query: ["page", "per_page", "enabled"],
	response: false,
} as const;
