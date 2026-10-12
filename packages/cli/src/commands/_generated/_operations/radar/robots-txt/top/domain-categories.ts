/** @generated from radar-get-robots-txt-top-domain-categories-by-files-parsed */
export default {
	method: "GET",
	path: () => "/radar/robots_txt/top/domain_categories",
	query: ["limit", "name", "userAgentCategory", "date", "format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
