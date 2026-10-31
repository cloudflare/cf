/** @generated from zero-trust.casb.asset-schemas.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/asset_schemas/${request.asset_class}`,
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
	},
} as const;
