/** @generated from zero-trust.casb.remediations.jobs.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/remediations/jobs",
	query: [
		"cursor",
		"page",
		"per_page",
		"search",
		"min_updated_at",
		"max_updated_at",
		"status",
		"triggered_by_actor",
		"integration_id",
		"order",
		"direction",
	],
	joined: ["triggered_by_actor"],
	errors: {
		400: "BadRequestError",
	},
} as const;
