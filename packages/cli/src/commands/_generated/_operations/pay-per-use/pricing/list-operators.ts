/** @generated from pay-per-use.pricing.list-operators */
export default {
	method: "GET",
	path: "/zones/{zone_id}/pay-per-use/operators",
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
