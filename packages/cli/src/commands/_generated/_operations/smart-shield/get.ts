/** @generated from smart-shield-get-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield`,
	errors: {
		500: "InternalServerError",
		502: "BadGatewayError",
	},
} as const;
