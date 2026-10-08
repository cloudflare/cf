/** @generated from radar.email.security.top.tlds.spoof.get */
export default {
	method: "GET",
	path: "/radar/email/security/top/tlds/spoof/{spoof}",
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
