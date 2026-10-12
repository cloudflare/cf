/** @generated from radar-get-email-security-top-tlds-by-spoof */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/email/security/top/tlds/spoof/${request.spoof}`,
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
