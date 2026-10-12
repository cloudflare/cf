/** @generated from post_InsertLogoQuery */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/logo/queries`,
	body: "json",
} as const;
