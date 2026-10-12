/** @generated from GetFindingInstance */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/findings/${request.finding_id}/instances/${request.instance_id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
