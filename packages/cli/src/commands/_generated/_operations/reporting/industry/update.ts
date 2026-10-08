/** @generated from reporting.industry.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/reporting/industry",
	body: "json",
	errors: {
		400: "BadRequestError",
		423: "LockedError",
		500: "InternalServerError",
	},
} as const;
