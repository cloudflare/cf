/** @generated from zero-trust.casb.exports.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/exports",
	query: ["page", "per_page", "status"],
	errors: {
		400: "BadRequestError",
	},
} as const;
