/** @generated from csam-scanner.get */
export default {
	method: "GET",
	path: "/zones/{zone_id}/settings/csam_scanner_third_party",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
