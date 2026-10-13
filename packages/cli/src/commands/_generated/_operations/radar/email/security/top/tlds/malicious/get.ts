/** @generated from radar.email.security.top.tlds.malicious.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/email/security/top/tlds/malicious/${request.malicious}`,
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"arc",
		"dkim",
		"dmarc",
		"spf",
		"tlsVersion",
		"tldCategory",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
