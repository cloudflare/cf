/** @generated from zero-trust.casb.finding-types.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/finding_types/${request.finding_type_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		422: "UnprocessableEntityError",
		500: "InternalServerError",
	},
} as const;
