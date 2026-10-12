/** @generated from smart-shield-patch-settings */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield`,
	body: "json",
	errors: {
		500: "InternalServerError",
		502: "BadGatewayError",
	},
} as const;
