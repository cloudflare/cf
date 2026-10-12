/** @generated from zero-trust.gateway.pacfiles.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/pacfiles`,
	query: ["page", "per_page"],
} as const;
