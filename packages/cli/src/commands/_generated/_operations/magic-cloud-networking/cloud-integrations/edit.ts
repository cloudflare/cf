/** @generated from providers-patch */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cloud/providers/${request.provider_id}`,
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
