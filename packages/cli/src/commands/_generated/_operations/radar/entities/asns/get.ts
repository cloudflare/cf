/** @generated from radar.entities.asns.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/entities/asns/${request.asn}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
