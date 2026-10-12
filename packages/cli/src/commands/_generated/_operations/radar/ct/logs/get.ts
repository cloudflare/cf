/** @generated from radar-get-certificate-log-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/ct/logs/${request.log_slug}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
