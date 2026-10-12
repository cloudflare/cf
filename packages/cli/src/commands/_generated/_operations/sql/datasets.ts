/** @generated from sql.datasets */
export default {
	method: "GET",
	path: () => "/analytics/sql/introspection",
	query: [
		"account_tag",
		"include_columns",
		"include_custom_attributes",
		"include_attributes",
		"include_wae",
		"include_lex",
		"dataset_name",
	],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		422: "UnprocessableEntityError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
