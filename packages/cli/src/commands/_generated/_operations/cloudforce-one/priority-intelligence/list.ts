/** @generated from get_PirList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence`,
	query: ["page", "per_page"],
	response: false,
} as const;
