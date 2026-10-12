/** @generated from brand-protection.logos.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/logo/queries`,
	query: ["id", "download"],
} as const;
