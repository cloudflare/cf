/** @generated from radar.email.security.summary-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/email/security/summary/${request.dimension}`,
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"arc",
		"dkim",
		"dmarc",
		"spf",
		"tlsVersion",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
