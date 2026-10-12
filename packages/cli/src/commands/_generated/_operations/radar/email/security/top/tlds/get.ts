/** @generated from radar.email.security.top.tlds.get */
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
