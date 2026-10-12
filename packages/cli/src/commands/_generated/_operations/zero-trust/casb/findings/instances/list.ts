/** @generated from ListFindingInstances */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/findings/${request.finding_id}/instances`,
	query: [
		"archived",
		"cursor",
		"direction",
		"max_affliction_date",
		"min_affliction_date",
		"order",
		"page",
		"per_page",
		"search",
		"remediation_statuses",
		"finding_instance_ids",
		"asset_ids",
	],
	joined: ["remediation_statuses"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
