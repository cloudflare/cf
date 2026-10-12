/** @generated from radar-get-robots-txt-top-user-agents-by-directive */
export default {
	method: "GET",
	path: () => "/radar/robots_txt/top/user_agents/directive",
	query: [
		"limit",
		"name",
		"userAgentCategory",
		"date",
		"domainCategory",
		"directive",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
