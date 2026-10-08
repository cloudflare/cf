/** @generated from pay-per-use.zones.set-can-be-enabled */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/pay-per-use/zones_can_be_enabled",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
	},
} as const;
