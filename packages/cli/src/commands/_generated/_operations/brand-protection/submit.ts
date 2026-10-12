/** @generated from post_SearchLogoSimilarity */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/logo/search`,
	query: ["showHistoric", "download"],
	body: "json",
} as const;
