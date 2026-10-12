/** @generated from radar-get-geolocation-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/geolocations/${request.geo_id}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
