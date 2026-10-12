/** @generated from get_DomainMatchList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/domain/matches`,
	query: [
		"offset",
		"limit",
		"query_id",
		"include_domain_id",
		"include_dismissed",
		"domain_search",
		"orderBy",
		"order",
	],
} as const;
