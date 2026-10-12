/** @generated from get_GetDomainQueries */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/domain/queries`,
	query: ["id", "page", "per_page"],
} as const;
