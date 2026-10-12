/** @generated from radar-get-email-security-top-tlds-by-messages */
export default {
	method: "GET",
	path: () => "/radar/email/security/top/tlds",
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
