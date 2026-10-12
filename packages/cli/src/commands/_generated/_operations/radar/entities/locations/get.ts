/** @generated from radar-get-entities-location-by-alpha2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/entities/locations/${request.location}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
