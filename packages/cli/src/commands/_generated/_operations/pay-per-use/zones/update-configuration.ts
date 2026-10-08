/** @generated from pay-per-use.zones.update-configuration */
export default {
	method: "PATCH",
	path: "/zones/{zone_id}/pay-per-use/configuration",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
