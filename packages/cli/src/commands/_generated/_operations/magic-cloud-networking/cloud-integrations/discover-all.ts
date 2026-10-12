/** @generated from providers-discover-all */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cloud/providers/discover`,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
