/** @generated from pay-per-use.usage-stats.get-account */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/pay-per-use/usage-stats",
	query: ["since", "until", "page", "per_page"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
