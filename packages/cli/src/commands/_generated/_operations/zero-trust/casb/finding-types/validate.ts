/** @generated from zero-trust.casb.finding-types.validate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/finding_types/validate`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
