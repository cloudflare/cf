/** @generated from radar.email.routing.summary-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/email/routing/summary/${request.dimension}`,
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"arc",
		"dkim",
		"dmarc",
		"spf",
		"ipVersion",
		"encrypted",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
