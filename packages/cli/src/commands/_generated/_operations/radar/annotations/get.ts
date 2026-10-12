/** @generated from radar.annotations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/annotations/${request.id}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
