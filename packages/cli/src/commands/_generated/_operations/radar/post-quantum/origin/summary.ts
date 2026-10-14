/** @generated from radar.post-quantum.origin.summary */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/post_quantum/origin/summary/${request.dimension}`,
	query: ["name", "dateRange", "dateStart", "dateEnd", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
