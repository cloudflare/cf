/** @generated from brand-protection.queries.undismiss */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/queries/${request.query_id}/matches/${request.domain_id}/undismiss`,
} as const;
