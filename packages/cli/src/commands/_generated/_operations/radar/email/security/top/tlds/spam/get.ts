/** @generated from radar.email.security.top.tlds.spam.get */
export default {
	method: "GET",
	path: "/radar/email/security/top/tlds/spam/{spam}",
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
