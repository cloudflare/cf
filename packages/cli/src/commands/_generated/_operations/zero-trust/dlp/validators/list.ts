/** @generated from zero-trust.dlp.validators.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators`,
	query: ["kind"],
} as const;
