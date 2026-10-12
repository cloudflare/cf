/** @generated from get_LogoMatchList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/logo/matches`,
	query: ["offset", "limit", "query_id", "download", "orderBy", "order"],
} as const;
