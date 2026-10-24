/** @generated from zero-trust.casb.exports.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/exports`,
	query: ["page", "per_page", "status"],
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
	},
} as const;
