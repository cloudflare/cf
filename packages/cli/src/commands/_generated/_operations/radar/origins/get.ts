/** @generated from radar-get-origin-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/origins/${request.slug}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
