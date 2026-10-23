/** @generated from zero-trust.casb.finding-types.remediation-types.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/finding_types/${request.finding_type_id}/remediation_types`,
	query: ["integration_id", "cursor", "page", "per_page"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
	},
} as const;
