/** @generated from radar-get-certificate-authority-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/ct/authorities/${request.ca_slug}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
