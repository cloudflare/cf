/** @generated from rssCuratedFeedList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/curated-feeds`,
	query: ["category", "include_inactive"],
} as const;
