/** @generated from zero-trust.casb.exports.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/exports/${request.id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
	},
} as const;
