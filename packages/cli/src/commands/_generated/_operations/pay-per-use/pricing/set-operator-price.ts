/** @generated from pay-per-use.pricing.set-operator-price */
export default {
	method: "POST",
	path: "/zones/{zone_id}/pay-per-use/operators/{operator_id}/price",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
