/** @generated from ohttp-gateway.enablement.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/ohttp-gateway`,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
