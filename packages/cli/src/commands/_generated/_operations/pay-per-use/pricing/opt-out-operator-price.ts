/** @generated from pay-per-use.pricing.opt-out-operator-price */
export default {
	method: "DELETE",
	path: "/zones/{zone_id}/pay-per-use/operators/{operator_id}/price",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
