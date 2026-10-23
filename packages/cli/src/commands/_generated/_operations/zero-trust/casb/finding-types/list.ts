/** @generated from zero-trust.casb.finding-types.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/finding_types`,
	query: [
		"page",
		"per_page",
		"vendors",
		"types",
		"origins",
		"severities",
		"search",
		"quarantined",
		"min_updated_at",
		"max_updated_at",
		"order",
		"direction",
	],
	joined: ["vendors", "types", "origins", "severities"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
	},
} as const;
