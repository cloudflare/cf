/** @generated from url-info.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/brand-protection/url-info`,
} as const;
