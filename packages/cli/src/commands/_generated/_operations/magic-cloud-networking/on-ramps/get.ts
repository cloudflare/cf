/** @generated from magic-cloud-networking.on-ramps.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cloud/onramps/${request.onramp_id}`,
	query: ["status", "vpcs", "post_apply_resources", "planned_resources"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
