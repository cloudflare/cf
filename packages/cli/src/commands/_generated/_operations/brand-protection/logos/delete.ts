/** @generated from brand-protection.logos.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/logo/queries/${request.query_id}`,
} as const;
