/** @generated from ListRemediationJobs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/remediations/jobs`,
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
