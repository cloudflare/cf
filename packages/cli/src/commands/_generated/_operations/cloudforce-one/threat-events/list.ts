/** @generated from get_EventListGet */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events`,
	query: [
		"cursor",
		"search",
		"searchBranches",
		"page",
		"pageSize",
		"orderBy",
		"order",
		"datasetId",
		"forceRefresh",
		"format",
		"cache",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
