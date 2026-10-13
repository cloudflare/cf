/** @generated from brand-protection.matches.bulk-dismiss */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/domain/matches/bulk-dismiss`,
	body: "json",
} as const;
